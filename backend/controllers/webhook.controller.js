import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import { Webhook } from "svix";

export const clerkWebHook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const SECRET_KEY = process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY;

  // raw body buffer (bodyParser.raw was used in the route)
  const payloadBuffer = req.body;
  const headers = req.headers;

  let evt;

  // 1) Prefer Svix webhook verification if webhook secret is present
  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      evt = wh.verify(payloadBuffer, headers);
    } catch (err) {
      console.error("Webhook svix verification failed:", err.message);
      return res.status(400).json({ message: "Webhook verification failed" });
    }
  } else if (SECRET_KEY) {
    // 2) Fallback: verify by secret key supplied in header
    // Accept either `Authorization: Bearer <SECRET_KEY>` or `x-clerk-secret: <SECRET_KEY>`
    const auth = (headers.authorization || "").toString();
    const headerSecret = headers["x-clerk-secret"] || headers["x-clerk-key"];

    const bearerMatch = auth.match(/^Bearer\s+(.+)$/i);
    const token = bearerMatch ? bearerMatch[1] : null;
    const provided = token || (Array.isArray(headerSecret) ? headerSecret[0] : headerSecret);

    if (!provided || provided !== SECRET_KEY) {
      console.error("Webhook secret key verification failed: missing or invalid key");
      return res.status(401).json({ message: "Invalid webhook secret key" });
    }

    // Parse JSON payload from raw buffer
    try {
      evt = JSON.parse(payloadBuffer.toString());
    } catch (err) {
      console.error("Failed to parse webhook payload JSON:", err.message);
      return res.status(400).json({ message: "Invalid webhook payload" });
    }
  } else {
    console.error("No webhook verification method configured: set CLERK_WEBHOOK_SECRET or CLERK_SECRET_KEY");
    return res.status(500).json({ message: "Webhook verification not configured" });
  }

  // Support both Svix event shape (evt.type, evt.data) and raw Clerk event payloads
  const eventType = evt.type || evt.event || (evt.data && evt.data.type) || null;
  const eventData = evt.data || evt.payload || evt;

  // Handle user.created
  if (eventType === "user.created" || eventType === "user.created.v1") {
    const data = eventData;
    const newUser = new User({
      clerkUserId: data.id,
      username: data.username || (data.email_addresses && data.email_addresses[0]?.email_address),
      email: data.email_addresses && data.email_addresses[0]?.email_address,
      img: data.profile_img_url,
    });

    await newUser.save();
  }

  // Handle user.deleted
  if (eventType === "user.deleted" || eventType === "user.deleted.v1") {
    const data = eventData;
    const deletedUser = await User.findOneAndDelete({ clerkUserId: data.id });

    if (deletedUser) {
      await Post.deleteMany({ user: deletedUser._id });
      await Comment.deleteMany({ user: deletedUser._id });
    }
  }

  return res.status(200).json({ message: "Webhook received" });
};
