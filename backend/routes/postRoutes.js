const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all posts - Public
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch posts"
        });
    }
});

// Get single post - Public
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("userId", "name");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch post"
        });
    }
});

// Create post - Protected
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const post = await Post.create({
            title,
            content,
            userId: req.user.userId
        });

        res.status(201).json({
            message: "Post created successfully",
            post
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create post"
        });
    }
});

// Update own post - Protected
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { title, content } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only edit your own posts"
            });
        }

        post.title = title;
        post.content = content;

        await post.save();

        res.json({
            message: "Post updated successfully",
            post
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update post"
        });
    }
});

// Delete own post - Protected
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own posts"
            });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.json({
            message: "Post deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete post"
        });
    }
});

module.exports = router;