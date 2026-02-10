import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/support/[id] - Get conversation with messages
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: conversationId } = await context.params;

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

    // Get conversation
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
        assignee: {
          select: {
            name: true,
          },
        },
        messages: {
          include: {
            sender: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access: user can see their own conversations, admins can see all
    if (conversation.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Mark messages as read (if customer is viewing, mark admin messages as read; if admin, mark customer messages)
    const isCustomer = user.id === conversation.userId;
    await prisma.supportMessage.updateMany({
      where: {
        conversationId,
        isRead: false,
        isFromCustomer: !isCustomer, // Read opposite messages
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        subject: conversation.subject,
        status: conversation.status,
        priority: conversation.priority,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        customer: {
          name: conversation.user.name || 'Customer',
          phone: conversation.user.phone,
        },
        assignee: conversation.assignee?.name,
        messages: conversation.messages.map((msg: any) => ({
          id: msg.id,
          message: msg.message,
          isFromCustomer: msg.isFromCustomer,
          senderName: msg.sender.name || (msg.sender.role === 'ADMIN' ? 'Support Agent' : 'You'),
          isRead: msg.isRead,
          createdAt: msg.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PATCH /api/support/[id] - Update conversation (admin only)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: conversationId } = await context.params;

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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied - Admin only' },
        { status: 403 }
      );
    }

    const { status, priority, assignTo } = await request.json();

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignTo !== undefined) updateData.assignedTo = assignTo || null;
    if (status === 'CLOSED' || status === 'RESOLVED') {
      updateData.closedAt = new Date();
    }

    const conversation = await prisma.supportConversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Conversation updated successfully',
      conversation: {
        id: conversation.id,
        status: conversation.status,
        priority: conversation.priority,
        assignedTo: conversation.assignedTo,
      },
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}
