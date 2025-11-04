import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/support/[id]/messages - Send a message in conversation
export async function POST(
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

    const { message } = await request.json();

    // Validate input
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Get conversation to verify access
    const conversation = await prisma.supportConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access: user can message their own conversations, admins can message any
    if (conversation.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Don't allow messages in closed conversations
    if (conversation.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot send messages to closed conversations' },
        { status: 400 }
      );
    }

    const isFromCustomer = user.id === conversation.userId;

    // Create message
    const supportMessage = await prisma.supportMessage.create({
      data: {
        conversationId,
        senderId: user.id,
        message: message.trim(),
        isFromCustomer,
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    // Update conversation status if admin is replying
    if (!isFromCustomer && conversation.status === 'OPEN') {
      await prisma.supportConversation.update({
        where: { id: conversationId },
        data: {
          status: 'IN_PROGRESS',
          assignedTo: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: supportMessage.id,
        message: supportMessage.message,
        isFromCustomer: supportMessage.isFromCustomer,
        senderName: supportMessage.sender.name || (supportMessage.sender.role === 'ADMIN' ? 'Support Agent' : 'You'),
        createdAt: supportMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
