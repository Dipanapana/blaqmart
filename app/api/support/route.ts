import { NextRequest, NextResponse } from 'next/server';

// GET /api/support - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { phone: authUser.phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get conversations based on role
    let conversations;
    if (user.role === 'ADMIN') {
      // Admins see all conversations or assigned ones
      const { searchParams } = new URL(request.url);
      const filter = searchParams.get('filter');

      conversations = await prisma.supportConversation.findMany({
        where: filter === 'assigned' ? { assignedTo: user.id } : undefined,
        include: {
          user: {
            select: {
              name: true,
              phone: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } else {
      // Regular users see their own conversations
      conversations = await prisma.supportConversation.findMany({
        where: {
          userId: user.id,
        },
        include: {
          assignee: {
            select: {
              name: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    return NextResponse.json({
      success: true,
      conversations: conversations.map((conv: any) => ({
        id: conv.id,
        subject: conv.subject,
        status: conv.status,
        priority: conv.priority,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv._count.messages,
        lastMessage: conv.messages[0]
          ? {
              text: conv.messages[0].message.substring(0, 100),
              createdAt: conv.messages[0].createdAt,
            }
          : null,
        user: user.role === 'ADMIN' ? {
          name: conv.user.name || 'Customer',
          phone: conv.user.phone,
        } : undefined,
        assignee: user.role !== 'ADMIN' ? conv.assignee?.name : undefined,
      })),
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/support - Create new conversation
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { phone: authUser.phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { subject, message, priority } = await request.json();

    // Validate input
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Create conversation with first message
    const conversation = await prisma.supportConversation.create({
      data: {
        userId: user.id,
        subject,
        priority: priority || 'MEDIUM',
        messages: {
          create: {
            senderId: user.id,
            message,
            isFromCustomer: true,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation created successfully',
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        priority: conversation.priority,
        createdAt: conversation.createdAt,
      },
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
