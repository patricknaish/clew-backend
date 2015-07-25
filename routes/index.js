/*jslint node: true, devel: true, sloppy:true, unparam: true, nomen: true*/

/* Status code constants */
var CREATED = 201, DELETED = 204, BAD_REQUEST = 400, NOT_FOUND = 404, SERVICE_UNAVAILABLE = 503;

/* Home page */
exports.index = {
    "get": function (req, res) {
        res.json({
            "links": {
                "questions": "/question",
                "users": "/user",
                "self": "/"
            }
        });
    }
};

/* List answers on a question */
var answer_listing = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Find all answers with the specified question_id */
            req.models.question_answer.find({question_id: req.params.qid}, function (err, answers) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answers found for question " + req.params.qid});
                    return;
                }
                var body = [], i;
                for (i = 0; i < answers.length; i += 1) {
                    body.push(answers[i].render());
                }
                res.json(body);
            });
        });
    }
};

/* List comments on an answer */
var answer_comment_listing = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Find all comments with the specified answer_id */
                req.models.answer_comment.find({answer_id: req.params.aid}, function (err, comments) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No comments found for answer " + req.params.aid});
                        return;
                    }
                    var body = [], i;
                    for (i = 0; i < comments.length; i += 1) {
                        body.push(comments[i].render());
                    }
                    res.json(body);
                });
            });
        });
    }
};

/* Interact with comments on an answer */
var answer_comment = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Get the comment with the specified id */
                req.models.answer_comment.get(req.params.cid, function (err, comment) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No comment found for " + req.params.cid});
                        return;
                    }
                    res.json(comment.render());
                });
            });
        });
    },
    "post": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Create the comment with the specified options */
                req.models.answer_comment.create([
                    {
                        "comment": req.body.comment,
                        "author_id": req.body.author_id,
                        "created": new Date(),
                        "answer_id": req.params.aid
                    }
                ], function (err, items) {
                    if (err) {
                        /* Notify the user if they are missing fields */
                        if (err.msg === "required") {
                            res.statusCode = BAD_REQUEST;
                            res.json({"error": "Required field " + err.property + " was not supplied"});
                            return;
                        }
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not create new comment on answer " + req.params.aid});
                        return;
                    }
                    /* Workaround for creation autofetch failure, to allow for correct rendering of URL */
                    req.models.answer_comment.get(items[0].id, function (err, comment) {
                        if (err) {
                            res.statusCode = NOT_FOUND;
                            res.json({"error": "No comment found for " + items[0].id});
                            return;
                        }
                        res.setHeader("Location", comment.render().links.self);
                        res.statusCode = CREATED;
                        res.json(comment.render());
                    });
                    /* This will work correctly if bug is fixed */
                    // res.setHeader("Location", items[0].render().links.self);
                    // res.statusCode = CREATED;
                    // res.json(items[0].render());
                });
            });
        });
    },
    "put": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Check the comment exists */
                req.models.answer_comment.get(req.params.cid, function (err, comment) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No comment found for  " + req.params.cid});
                        return;
                    }
                    if (req.body.comment) { comment.comment = req.body.comment; }
                    comment.updated = new Date();
                    /* Update the comment */
                    comment.save(function (err) {
                        if (err) {
                            res.statusCode = SERVICE_UNAVAILABLE;
                            res.json({"error": "Could not update comment " + req.params.cid});
                            return;
                        }
                        res.json(comment.render());
                    });
                });
            });
        });
    },
    "delete": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Check the comment exists */
                req.models.answer_comment.get(req.params.cid, function (err, comment) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No comment found for  " + req.params.cid});
                        return;
                    }
                    /* Delete the comment */
                    comment.remove(function (err) {
                        if (err) {
                            res.statusCode = SERVICE_UNAVAILABLE;
                            res.json({"error": "Could not delete comment " + req.params.cid});
                            return;
                        }
                        res.statusCode = DELETED;
                        res.json({"status": "removed"});
                    });
                });
            });
        });
    },
    "listing": answer_comment_listing
};

/* Interact with answers on a question */
var question_answer = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Get the answer with the specified id */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                res.json(answer.render());
            });
        });
    },
    "post": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Create the answer with the specified options */
            req.models.question_answer.create([
                {
                    "answer" : req.body.answer,
                    "author_id": req.body.author_id,
                    "question_id": req.params.qid,
                    "created": new Date()
                }
            ], function (err, items) {
                if (err) {
                    /* Notify the user if they are missing fields */
                    if (err.msg === "required") {
                        res.statusCode = BAD_REQUEST;
                        res.json({"error": "Required field " + err.property + " was not supplied"});
                        return;
                    }
                    res.statusCode = SERVICE_UNAVAILABLE;
                    res.json({"error": "Could not create new answer on question " + req.params.qid});
                    return;
                }
                res.setHeader("Location", items[0].render().links.self);
                res.statusCode = CREATED;
                res.json(items[0].render());
            });
        });
    },
    "put": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                if (req.body.answer) { answer.answer = req.body.answer; }
                if (req.body.author_id) { answer.author_id = req.body.author_id; }
                answer.updated = new Date();
                /* Update the answer */
                answer.save(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not update answer " + req.params.aid});
                        return;
                    }
                    res.json(answer.render());
                });
            });
        });
    },
    "delete": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the answer exists */
            req.models.question_answer.get(req.params.aid, function (err, answer) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No answer found for " + req.params.aid});
                    return;
                }
                /* Delete the answer and its comments */
                answer.removeChildren(function () {
                    answer.remove(function (err) {
                        if (err) {
                            res.statusCode = SERVICE_UNAVAILABLE;
                            res.json({"error": "Could not delete answer " + req.params.aid});
                            return;
                        }
                        res.statusCode = DELETED;
                        res.json({"status": "removed"});
                    });
                });
            });
        });
    },
    "listing": answer_listing,
    "comment": answer_comment
};

/* List comments on a question */
var question_comment_listing = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Find all comments with the specified question_id */
            req.models.question_comment.find({question_id: req.params.qid}, function (err, comments) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No comments found for question " + req.params.qid});
                    return;
                }
                var body = [], i;
                for (i = 0; i < comments.length; i += 1) {
                    body.push(comments[i].render());
                }
                res.json(body);
            });
        });
    }
};

/* Interact with comments on a question */
var question_comment = {
    "get": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Get the comment with the specified id */
            req.models.question_comment.get(req.params.cid, function (err, comment) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No comment found for " + req.params.cid});
                    return;
                }
                res.json(comment.render());
            });
        });
    },
    "post": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Create the comment with the specified options */
            req.models.question_comment.create([
                {
                    "comment": req.body.comment,
                    "author_id": req.body.author_id,
                    "created": new Date(),
                    "question_id": req.params.qid
                }
            ], function (err, items) {
                if (err) {
                    /* Notify the user if they are missing fields */
                    if (err.msg === "required") {
                        res.statusCode = BAD_REQUEST;
                        res.json({"error": "Required field " + err.property + " was not supplied"});
                        return;
                    }
                    res.statusCode = SERVICE_UNAVAILABLE;
                    res.json({"error": "Could not create new comment on question " + req.params.qid});
                    return;
                }
                res.setHeader("Location", items[0].render().links.self);
                res.statusCode = CREATED;
                res.json(items[0].render());
            });
        });
    },
    "put": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the comment exists */
            req.models.question_comment.get(req.params.cid, function (err, comment) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No comment found for " + req.params.cid});
                    return;
                }
                if (req.body.comment) { comment.comment = req.body.comment; }
                comment.updated = new Date();
                /* Update the comment */
                comment.save(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not update comment " + req.params.cid});
                        return;
                    }
                    res.json(comment.render());
                });
            });
        });
    },
    "delete": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Check the comment exists */
            req.models.question_comment.get(req.params.cid, function (err, comment) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No comment found for " + req.params.cid});
                    return;
                }
                /* Delete the comment */
                comment.remove(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not delete comment " + req.params.cid});
                        return;
                    }
                    res.statusCode = DELETED;
                    res.json({"status": "removed"});
                });
            });
        });
    },
    "listing": question_comment_listing
};

/* List questions */
var question_listing = {
    "get": function (req, res) {
        /* Find all questions */
        req.models.question.find({}, function (err, questions) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No questions found"});
                return;
            }
            var body = [], i;
            for (i = 0; i < questions.length; i += 1) {
                body.push(questions[i].render());
            }
            res.json(body);
        });
    }
};

/* Interact with a question */
exports.question = {
    "get": function (req, res) {
        /* Get the question with the specified id */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            res.json(question.render());
        });
    },
    "post": function (req, res) {
        /* Create the question with the specified options */
        req.models.question.create([
            {
                "title": req.body.title,
                "question": req.body.question,
                "author_id": req.body.author_id,
                "created": new Date()
            }
        ], function (err, items) {
            if (err) {
                if (err.msg === "required") {
                    /* Notify the user if they are missing fields */
                    res.statusCode = BAD_REQUEST;
                    res.json({"error": "Required field " + err.property + " was not supplied"});
                    return;
                }
                res.statusCode = SERVICE_UNAVAILABLE;
                res.json({"error": "Could not create new question"});
                return;
            }
            res.setHeader("Location", items[0].render().links.self);
            res.statusCode = CREATED;
            res.json(items[0].render());
        });
    },
    "put": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            if (req.body.question) { question.question = req.body.question; }
            if (req.body.title) { question.title = req.body.title; }
            question.updated = new Date();
            /* Update the question */
            question.save(function (err) {
                if (err) {
                    res.statusCode = SERVICE_UNAVAILABLE;
                    res.json({"error": "Could not update question " + req.params.qid});
                    return;
                }
                res.json(question.render());
            });
        });
    },
    "delete": function (req, res) {
        /* Check the question exists */
        req.models.question.get(req.params.qid, function (err, question) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No question found for " + req.params.qid});
                return;
            }
            /* Delete the question and its comments */
            question.removeChildren(function () {
                question.remove(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not delete question " + req.params.qid});
                        return;
                    }
                    res.statusCode = DELETED;
                    res.json({"status": "removed"});
                });
            });
        });
    },
    "listing": question_listing,
    "answer": question_answer,
    "comment": question_comment
};

/* List users */
var user_listing = {
    "get": function (req, res) {
        /* Find all users */
        req.models.user.find({}, function (err, users) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No users found"});
                return;
            }
            var body = [], i;
            for (i = 0; i < users.length; i += 1) {
                body.push(users[i].render());
            }
            res.json(body);
        });
    }
};

/* Interact with a user */
exports.user = {
    "get": function (req, res) {
        /* Get the user with the specified id */
        req.models.user.get(req.params.uid, function (err, user) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No user found for " + req.params.uid});
                return;
            }
            res.json(user.render());
        });
    },
    "post": function (req, res) {
        /* Create the comment with the specified options */
        req.models.user.create([
            {
                "name": req.body.name,
                "created": new Date()
            }
        ], function (err, items) {
            if (err) {
                /* Notify the user if they are missing fields */
                if (err.msg === "required") {
                    res.statusCode = BAD_REQUEST;
                    res.json({"error": "Required field " + err.property + " was not supplied"});
                    return;
                }
                res.statusCode = SERVICE_UNAVAILABLE;
                res.json({"error": "Could not create new user"});
                return;
            }
            res.setHeader("Location", items[0].render().links.self);
            res.statusCode = CREATED;
            res.json(items[0].render());
        });
    },
    "put": function (req, res) {
        /* Check the user exists */
        req.models.user.get(req.params.uid, function (err, user) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No user found for " + req.params.uid});
                return;
            }
            if (req.body.name) { user.name = req.body.name; }
            user.updated = new Date();
            /* Update the user */
            user.save(function (err) {
                if (err) {
                    res.statusCode = SERVICE_UNAVAILABLE;
                    res.json({"error": "Could not update user " + req.params.uid});
                    return;
                }
                res.json(user.render());
            });
        });
    },
    "delete": function (req, res) {
        /* Check the user exists */
        req.models.user.get(req.params.uid, function (err, user) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No user found for " + req.params.uid});
                return;
            }
            /* Delete the user */
            user.removeChildren(function () {
                user.remove(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not delete user " + req.params.uid});
                        return;
                    }
                    res.statusCode = DELETED;
                    res.json({"status": "removed"});
                });
            });
        });
    },
    "listing": user_listing
};
