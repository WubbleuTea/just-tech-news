const router = require('express').Router();
const sequelize = require('../../config/connection');
const { User, Comment, Post } = require('../../models');
const withAuth = require('../../utils/auth')

router.get('/', (req, res) => {
    Comment.findAll({
        attributes: [
        'id', 
        'comment_text',  
        'created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
    ],
    include: [
        {
            model: User,
            attributes: ['username']
        },
        {
            model: Post,
            attributes: ['title']
        }
    ]
    }).then(dbCommentData => {
        res.json(dbCommentData)
    })
});

router.post('/', withAuth, (req, res) => {
    // check the session
    if (req.session) {
        Comment.create({
            comment_text: req.body.comment_text,
            post_id: req.body.post_id,
            // uses the id from the session
            user_id: req.session.user_id
            
        })
        .then(dbCommentData => res.json(dbCommentData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    }
});

router.delete('/:id', withAuth, (req, res) => {
    Comment.destroy({
        where: {
        id: req.params.id
        }
    })
    .then(dbCommentData => {
        if (!dbCommentData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbCommentData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});


module.exports = router;