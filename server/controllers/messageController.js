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
