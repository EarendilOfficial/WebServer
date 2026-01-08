const mongoose = require('mongoose');
const mailDB = mongoose.createConnection('mongodb://localhost:27017/mail');
const Mail = mailDB.model('Mail', require('../schema/mailSchema'));

// Get mails for the authenticated user (inbox + sent)
async function getMyMails(req, res) {
    try {
        const username = req.user.username;
        if (!username) return res.status(401).json({ error: 'Unauthorized' });

        const docs = await Mail.find({ $or: [{ to: username }, { from: username }] }).lean().exec();

        const mails = docs.map((m) => ({
            id: m._id.toString(),
            to: m.to,
            from: m.from,
            subject: m.subject,
            body: m.body,
            date: (m.date && new Date(m.date).toISOString()) || new Date().toISOString(),
            // normalize status for the frontend: 'sent' if user is sender, otherwise 'new'/'read'
            status: (m.from === username) ? 'sent' : (m.status === 'unread' ? 'new' : 'read')
        }));

        mails.sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first

        return res.status(200).json(mails);
    } catch (e) {
        console.error('[ERROR] Unable to get user mail list with: mailController.getMyMails', e);
        return res.status(500).json({ error: 'Error retrieving mails' });
    }
}

// Create a new mail (sender is taken from authenticated user)
async function createMail(req, res) {
    try {
        const username = req.user && req.user.username;
        if (!username) return res.status(401).json({ error: 'Unauthorized' });

        const { to, subject, body } = req.body || {};
        if (!to || typeof subject === 'undefined' || typeof body === 'undefined') {
            return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
        }

        const mail = new Mail({ to, from: username, subject, body, date: new Date(), status: 'unread' });
        await mail.save();

        return res.status(201).json({ id: mail._id.toString(), name: username });
    } catch (e) {
        console.error('[ERROR] Unable to create mail with: mailController.createMail', e);
        return res.status(500).json({ error: 'Error creating mail' });
    }
}

// Delete a mail if the authenticated user is sender or recipient
async function deleteMail(req, res) {
    try {
        const username = req.user && req.user.username;
        if (!username) return res.status(401).json({ error: 'Unauthorized' });

        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'Missing id parameter' });

        const deleted = await Mail.findOneAndDelete({ _id: id, $or: [{ to: username }, { from: username }] }).lean().exec();
        if (!deleted) return res.status(404).json({ error: 'Mail not found' });

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('[ERROR] Unable to delete mail with: mailController.deleteMail', e);
        return res.status(500).json({ error: 'Error deleting mail' });
    }
}

// Mark mail as read (only recipient can do this)
async function markMailRead(req, res) {
    try {
        const username = req.user && req.user.username;
        if (!username) return res.status(401).json({ error: 'Unauthorized' });

        const id = req.params.id;
        if (!id) return res.status(400).json({ error: 'Missing id parameter' });

        const updated = await Mail.findOneAndUpdate({ _id: id, to: username }, { $set: { status: 'read' } }, { new: true }).lean().exec();
        if (!updated) return res.status(404).json({ error: 'Mail not found or unauthorised' });

        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('[ERROR] Unable to mark mail read with: mailController.markMailRead', e);
        return res.status(500).json({ error: 'Error marking mail as read' });
    }
}

module.exports = { getMyMails, createMail, deleteMail, markMailRead };
