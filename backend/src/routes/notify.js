// ─── backend/src/routes/notify.js ───
// Add this new route to your Express backend

const express = require('express');
const router  = express.Router();
const nodemailer = require('nodemailer');

// POST /api/notify/admin
// Called when customer clicks "Notify Me" on out-of-stock product
router.post('/admin', async (req, res) => {
  try {
    const {
      product_name,
      customer_name,
      customer_email,
      customer_phone,
      admin_emails,
    } = req.body;

    // Configure email transporter
    // Uses Gmail - change to your email provider
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,    // your gmail
        pass: process.env.EMAIL_PASS,    // gmail app password
      },
    });

    // Email content
    const mailOptions = {
      from:    process.env.EMAIL_USER,
      to:      (admin_emails || [process.env.ADMIN_EMAIL]).join(','),
      subject: `🔔 New Stock Alert Request — ${product_name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 2rem; background: #f5f0e8; border-radius: 8px;">
          <div style="background: #1c2b1a; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; text-align: center;">
            <h2 style="color: #c9a84c; font-style: italic; margin: 0; font-size: 1.5rem;">Bhumi Old School Foods</h2>
            <p style="color: rgba(245,240,232,0.7); font-size: 0.75rem; margin: 4px 0 0; letter-spacing: 2px; text-transform: uppercase;">Admin Notification</p>
          </div>

          <h3 style="color: #1c2b1a; margin-bottom: 0.5rem;">🔔 New Stock Alert Request</h3>
          <p style="color: #6b7c5e; margin-bottom: 1.5rem;">A customer wants to be notified when a product is back in stock.</p>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <tr style="border-bottom: 1px solid #ede5d6;">
              <td style="padding: 0.75rem 1rem; color: #6b7c5e; font-size: 0.85rem; width: 40%;">Product</td>
              <td style="padding: 0.75rem 1rem; color: #1c2b1a; font-weight: 700;">${product_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ede5d6;">
              <td style="padding: 0.75rem 1rem; color: #6b7c5e; font-size: 0.85rem;">Customer Name</td>
              <td style="padding: 0.75rem 1rem; color: #1c2b1a; font-weight: 600;">${customer_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ede5d6;">
              <td style="padding: 0.75rem 1rem; color: #6b7c5e; font-size: 0.85rem;">Email</td>
              <td style="padding: 0.75rem 1rem; color: #1c2b1a;">
                ${customer_email ? `<a href="mailto:${customer_email}" style="color: #c9a84c;">${customer_email}</a>` : '—'}
              </td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 1rem; color: #6b7c5e; font-size: 0.85rem;">Phone</td>
              <td style="padding: 0.75rem 1rem; color: #1c2b1a;">
                ${customer_phone ? `<a href="tel:${customer_phone}" style="color: #c9a84c;">${customer_phone}</a>` : '—'}
              </td>
            </tr>
          </table>

          <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(201,168,76,0.1); border-radius: 8px; border: 1px solid rgba(201,168,76,0.3);">
            <p style="color: #6b3a2a; font-size: 0.85rem; margin: 0;">
              💡 <strong>Action Required:</strong> Go to Admin Panel → Products → Mark "${product_name}" as In Stock when restocked. The customer will be automatically notified.
            </p>
          </div>

          <p style="color: #6b7c5e; font-size: 0.75rem; text-align: center; margin-top: 1.5rem;">
            View all notification requests at 
            <a href="${process.env.FRONTEND_URL}/admin/notifications" style="color: #c9a84c;">
              Admin → Notifications
            </a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Admin notified successfully' });

  } catch (err) {
    console.error('Email notification error:', err);
    // Don't fail the request if email fails
    // The DB already saved the request
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;
