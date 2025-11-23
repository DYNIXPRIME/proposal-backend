import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root test
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Yes button submit request handler
app.post("/submit", async (req, res) => {
    const user = req.body.user || "Unknown User";

    const msg = `🎉 Congratulations bro! She accepted 😭🔥\n\nUser: ${user}`;

    try {
        // Instagram message API (placeholder for now)
        await axios.post("https://example.com/send", {
            username: process.env.INSTAGRAM_USERNAME,
            password: process.env.INSTAGRAM_PASSWORD,
            target: process.env.TARGET_USER,
            message: msg
        });

        return res.json({ success: true, message: "Form submitted" });
    } catch (err) {
        console.error("Error sending message:", err);
        return res.status(500).json({ success: false, error: "Something went wrong" });
    }
});

// PORT setup for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
