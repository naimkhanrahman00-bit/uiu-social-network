const Message = require('../models/Message');

exports.startConversation = async (req, res) => {
    try {
        const { recipientId, initialMessage } = req.body;
        const senderId = req.user.id;

        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }

        if (parseInt(recipientId) === parseInt(senderId)) {
            return res.status(400).json({ message: 'Cannot start conversation with yourself' });
        }

        let conversationId = await Message.createConversation(senderId, recipientId);

        if (initialMessage) {
            await Message.addMessage(conversationId, senderId, initialMessage);
        }

        res.status(201).json({
            message: 'Conversation started',
            conversationId: conversationId
        });

    } catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const conversations = await Message.getConversations(userId);
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await Message.getMessages(conversationId);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const senderId = req.user.id;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const messageId = await Message.addMessage(conversationId, senderId, content);
        res.status(201).json({ message: 'Message sent', messageId });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const userId = req.user.id;
        await Message.markAsRead(conversationId, userId);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
