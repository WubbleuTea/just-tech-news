const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Vote, Comment } = require('../../models');
const withAuth = require('../../utils/auth')

router.get('/', (req,res) => {
    console.log('===================');
    Post.findAll({
        //Query configuration
        attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        order: [['created_at', 'DESC']],
        include: [
              // comments are added to the post notice you need the user name model both in the comment for the commenter 
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
            },
            // and you need the user for the poster
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//finds one post
router.get('/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: [
            'id', 
            'post_url', 
            'title', 
            'created_at', 
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
      include: [
          // comments are added to the post notice you need the user name model both in the comment for the commenter 
          {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
                model: User,
                attributes: ['username']
            }
        },
        // and you need the user for the poster
        {
            model: User,
            attributes: ['username']
        }
      ]
    })
    .then(dbPostData => {
        if (!dbPostData) {
        res.status(404).json({ message: 'No post found with this id' });
        return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', withAuth, (req, res) => {
    // expects {title: 'Taskmaster goes public!', post_url: 'https://taskmaster.com/press', user_id: 1}
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.session.user_id
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//PUT /api/posts/upvote (updates votes on a post)
router.put('/upvote', withAuth, (req, res) => {
    if (req.session) {
        // custom static method created in models/Post.js
        Post.upvote({ ...req.body, user_id: req.session.user_id}, { Vote })
        .then(dbPostData => res.json(dbPostData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err)
        });
    }
});

// update the title
router.put('/:id', withAuth, (req, res) => {
    Post.update(
      {
        title: req.body.title
      },
      {
        where: {
          id: req.params.id
        }
      }
    )
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

//Delete Post
router.delete('/:id', withAuth, (req, res) => {
    Post.destroy({
        where: {
        id: req.params.id
        }
    })
    .then(dbPostData => {
        if (!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;