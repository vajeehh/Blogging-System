const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get comments for a post - Public
router.get("/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({
            postId: req.params.postId
        })
            .populate("userId", "name")
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch comments"
        });
    }
});


// Create comment - Protected
router.post("/:postId", authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Comment is required"
            });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            content,
            postId: req.params.postId,
            userId: req.user.userId
        });

        const populatedComment = await comment.populate(
            "userId",
            "name"
        );

        res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add comment"
        });
    }
});


// Delete own comment - Protected
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        if (comment.userId.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            });
        }

        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete comment"
        });
    }
});


module.exports = router;