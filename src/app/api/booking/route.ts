import { NextRequest, NextResponse } from "next/server";

interface BookingData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const data: BookingData = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.phone || !data.service || !data.date || !data.time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send confirmation email via WhatsApp-style notification
    // In production, integrate with:
    // - SendGrid / Resend / Nodemailer for email
    // - Twilio for WhatsApp API
    // - Stripe for payment processing

    const whatsappMessage = encodeURIComponent(
      `New Booking Request!\n\n` +
      `Name: ${data.name}\n` +
      `Email: ${data.email}\n` +
      `Phone: ${data.phone}\n` +
      `Service: ${data.service}\n` +
      `Date: ${data.date}\n` +
      `Time: ${data.time}\n` +
      `Message: ${data.message || "N/A"}`
    );

    // Send WhatsApp notification to Moatasem
    const whatsappApiUrl = `https://api.whatsapp.com/send?phone=972507774694&text=${whatsappMessage}`;

    // If EMAIL_API_KEY is configured, send email notification
    if (process.env.EMAIL_API_KEY && process.env.EMAIL_SERVICE_URL) {
      try {
        await fetch(process.env.EMAIL_SERVICE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
          },
          body: JSON.stringify({
            to: "moatasim.akash@gmail.com",
            subject: `New Booking: ${data.service} — ${data.name}`,
            html: `
              <h2>New Booking Request</h2>
              <table style="border-collapse: collapse; width: 100%;">
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Service</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.service}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.time}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.message || "N/A"}</td></tr>
              </table>
            `,
          }),
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Don't fail the booking if email fails
      }
    }

    // If STRIPE_SECRET_KEY is configured, create a payment intent (future)
    // if (process.env.STRIPE_SECRET_KEY) {
    //   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: getServicePrice(data.service),
    //     currency: 'ils',
    //     metadata: { booking_name: data.name, service: data.service },
    //   });
    // }

    return NextResponse.json({
      success: true,
      message: "Booking request received",
      whatsappUrl: whatsappApiUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
