/*jslint node: true, devel: true, sloppy:true, unparam: true, nomen: true*/

/* Status code constants */
var CREATED = 201, DELETED = 204, BAD_REQUEST = 400, NOT_FOUND = 404, SERVICE_UNAVAILABLE = 503;

/* List segments on a path */
var annotation_listing = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Find all paths with the specified location_id */
            req.models.location_path.get(req.params.pid, function (err, paths) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No paths found for location " + req.params.lid});
                    return;
                }

                req.models.path_annotation.find({path_id: req.params.pid}, function (err, annotation) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No annotations found for path " + req.params.pid});
                        return;
                    }
                    var body = [], i;
                    for (i = 0; i < annotation.length; i += 1) {
                        body.push(annotation[i].render());
                    }
                    res.json(body);
                });
            });
        });
    }
};

/* Interact with segments on a path */
var path_annotation = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Get the path with the specified id */
            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }
                req.models.path_annotation.get(req.params.aid, function (err, annotation) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No annotation found for " + req.params.aid});
                        return;
                    }
                    res.json(annotation.render());
                });
            });
        });
    },
    "post": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }

            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }

                req.models.path_segment.get(req.body.start_segment, function (err, start_segment) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No segment found for " + req.body.start_segment});
                        return;
                    }

                    req.models.path_segment.get(req.body.end_segment, function (err, end_segment) {
                        if (err) {
                            res.statusCode = NOT_FOUND;
                            res.json({"error": "No segment found for " + req.body.end_segment});
                            return;
                        }

                        /* Create the path with the specified options */
                        req.models.path_annotation.create([
                            {
                                "start_segment_id": req.body.start_segment_id,
                                "end_segment_id": req.body.end_segment_id,
                                "type": req.body.type,
                                "message": req.body.message,
                                "path_id": req.params.pid,
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
                                res.json({"error": "Could not create new annotation on path " + req.params.pid + ": " + err});
                                return;
                            }
                            res.setHeader("Location", items[0].render().self);
                            res.statusCode = CREATED;
                            res.json(items[0].render());
                        });
                    });
                });
            });
        });
    },
    "listing": annotation_listing
};

/* List segments on a path */
var segment_listing = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Find all paths with the specified location_id */
            req.models.location_path.get(req.params.pid, function (err, paths) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No paths found for location " + req.params.lid});
                    return;
                }

                req.models.path_segment.find({path_id: req.params.pid}, function (err, segments) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No segments found for path " + req.params.pid});
                        return;
                    }
                    var body = [], i;
                    for (i = 0; i < segments.length; i += 1) {
                        body.push(segments[i].render());
                    }
                    res.json(body);
                });
            });
        });
    }
};

/* Interact with segments on a path */
var path_segment = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Get the path with the specified id */
            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }
                req.models.path_segment.get(req.params.aid, function (err, segment) {
                    if (err) {
                        res.statusCode = NOT_FOUND;
                        res.json({"error": "No segment found for " + req.params.aid});
                        return;
                    }
                    res.json(segment.render());
                });
            });
        });
    },
    "post": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }

            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }

                /* Create the path with the specified options */
                req.models.path_segment.create([
                    {
                        "bearing": req.body.bearing,
                        "distance": req.body.distance,
                        "elevation": req.body.elevation,
                        "angle_format": req.body.angle_format,
                        "distance_format": req.body.distace_format,
                        "path_id": req.params.pid,
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
                        res.json({"error": "Could not create new segment on path " + req.params.pid + ": " + err});
                        return;
                    }
                    res.setHeader("Location", items[0].render().self);
                    res.statusCode = CREATED;
                    res.json(items[0].render());
                });
            });
        });
    },
    "listing": segment_listing
};

/* List paths on a location */
var path_listing = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Find all paths with the specified location_id */
            req.models.location_path.find({location_id: req.params.lid}, function (err, paths) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No paths found for location " + req.params.lid});
                    return;
                }
                var body = [], i;
                for (i = 0; i < paths.length; i += 1) {
                    body.push(paths[i].render());
                }
                res.json(body);
            });
        });
    }
};

/* Interact with paths on a location */
var location_path = {
    "get": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Get the path with the specified id */
            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }
                res.json(path.render());
            });
        });
    },
    "post": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Create the path with the specified options */
            req.models.location_path.create([
                {
                    "name": req.body.name,
                    "location_id": req.params.lid,
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
                    res.json({"error": "Could not create new path on location " + req.params.lid + ": " + err});
                    return;
                }
                res.setHeader("Location", items[0].render().self);
                res.statusCode = CREATED;
                res.json(items[0].render());
            });
        });
    },
    "put": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Check the path exists */
            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }
                if (req.body.name) { path.name = req.body.name; }
                path.updated = new Date();
                /* Update the path */
                path.save(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not update path " + req.params.pid + ": " + err});
                        return;
                    }
                    res.json(path.render());
                });
            });
        });
    },
    "delete": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Check the path exists */
            req.models.location_path.get(req.params.pid, function (err, path) {
                if (err) {
                    res.statusCode = NOT_FOUND;
                    res.json({"error": "No path found for " + req.params.pid});
                    return;
                }
                /* Delete the path and its comments */
                path.removeChildren(function () {
                    path.remove(function (err) {
                        if (err) {
                            res.statusCode = SERVICE_UNAVAILABLE;
                            res.json({"error": "Could not delete path " + req.params.pid + ": " + err});
                            return;
                        }
                        res.statusCode = DELETED;
                        res.json({"status": "removed"});
                    });
                });
            });
        });
    },
    "listing": path_listing,
    "segment": path_segment,
    "annotation": path_annotation
};

/* List users */
var location_listing = {
    "get": function (req, res) {
        /* Find all users */
        req.models.location.find({}, function (err, locations) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No locations found"});
                return;
            }
            var body = [], i;
            for (i = 0; i < locations.length; i += 1) {
                body.push(locations[i].render());
            }
            res.json(body);
        });
    }
};

/* Interact with a location */
exports.location = {
    "get": function (req, res) {
        /* Get the location with the specified id */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            res.json(location.render());
        });
    },
    "post": function (req, res) {
        /* Create the location with the specified options */
        req.models.location.create([
            {
                "name": req.body.name,
                "start_point": req.body.start_point,
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
                res.json({"error": "Could not create new location: " + err});
                return;
            }
            res.setHeader("Location", items[0].render().self);
            res.statusCode = CREATED;
            res.json(items[0].render());
        });
    },
    "put": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            if (req.body.start_point) { location.start_point = req.body.start_point; }
            if (req.body.name) { location.name = req.body.name; }
            location.updated = new Date();
            /* Update the location */
            location.save(function (err) {
                if (err) {
                    res.statusCode = SERVICE_UNAVAILABLE;
                    res.json({"error": "Could not update location " + req.params.lid + ": " + err});
                    return;
                }
                res.json(location.render());
            });
        });
    },
    "delete": function (req, res) {
        /* Check the location exists */
        req.models.location.get(req.params.lid, function (err, location) {
            if (err) {
                res.statusCode = NOT_FOUND;
                res.json({"error": "No location found for " + req.params.lid});
                return;
            }
            /* Delete the location and its comments */
            location.removeChildren(function () {
                location.remove(function (err) {
                    if (err) {
                        res.statusCode = SERVICE_UNAVAILABLE;
                        res.json({"error": "Could not delete location " + req.params.lid + ": " + err});
                        return;
                    }
                    res.statusCode = DELETED;
                    res.json({"status": "removed"});
                });
            });
        });
    },
    "listing": location_listing,
    "path": location_path
};