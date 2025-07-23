const { runQuery, allQuery } = require('../config/database');

const getMessagesByReceiverId = async (req, res) => {
  try {
    const receiverId = req.params.receiverId;
    const patientMessages = await allQuery(
      'SELECT * FROM messages WHERE receiver = $1 OR sender = $2',
      [receiverId, receiverId]
    );
    if (req.user.role === 'patient' && req.user.id !== receiverId) {
      return res.status(403).json({ message: 'Access Denied: Patients can only view their own messages.' });
    }
    res.json(patientMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(400).json({ message: 'Invalid Receiver ID format.' });
  }
};

const createMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    if (!sender || !receiver || !content) {
      return res.status(400).send('Missing sender, receiver, or content');
    }
    if (req.user.role === 'patient' && req.user.id !== sender && req.user.id !== receiver) {
      return res.status(403).json({ message: 'Access Denied: Patients can only send messages as themselves or to themselves.' });
    }
    const newMessage = { sender, receiver, content, timestamp: Date.now() };
    const result = await runQuery(
      `INSERT INTO messages (sender, receiver, content, timestamp) VALUES ($1, $2, $3, $4)`,
      Object.values(newMessage)
    );
    res.status(201).json({ ...newMessage, id: result.id });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};

module.exports = { getMessagesByReceiverId, createMessage };