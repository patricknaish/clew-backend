/*jslint node: true, devel: true, sloppy:true, unparam: true, nomen: true*/
var orm = require('orm');

exports.define = function (app) {
    /* Connect to the database */
    app.use(orm.express("sqlite://database.db", {
        define: function (db, models, next) {
            /* Define the location table */
            models.location = db.define("location", {
                name: {
                    type: "text",
                    required: true
                },
                start_point: {
                    type: "text",
                    required: true
                },
                created: {
                    type: "date",
                    required: false
                },
                updated: {
                    type: "date",
                    required: false
                }
            }, {
                methods: {
                    /* Remove all paths on a location */
                    removeChildren: function (next) {
                        this.getPaths(function (err, paths) {
                            var path, my_path;
                            var removed = function (removedPath) {
                                removedPath.remove();
                            };
                            for (path = 0; path < paths.length; path += 1) {
                                my_path = paths[path];
                                my_path.removeChildren(removed(my_path));
                            }
                        });
                        if (next) {
                            next();
                        }
                    },
                    /* Render the model's fields for sending to the user */
                    render: function () {
                        return {
                            id: this.id,
                            name: this.name,
                            start_point: this.start_point,
                            created: this.created,
                            updated: this.updated,
                            paths: "/location/" + this.id + "/path",
                            self: "/location/" + this.id
                        };
                    }
                }
            });
            /* Define the path table */
            models.location_path = db.define("path", {
                name: {
                    type: "text",
                    required: true
                },
                created: {
                    type: "date",
                    required: false
                },
                updated: {
                    type: "date",
                    required: false
                },
                location_id: {
                    type: "number",
                    required: true
                }
            }, {
                methods: {
                    /* Remove all segments and annotations on an path */
                    removeChildren: function (next) {
                        this.getSegments(function (err, segments) {
                            var segment, my_segment;
                            var removed = function (removedsegment) {
                                removedsegment.remove();
                            };
                            for (segment = 0; segment < segments.length; segment += 1) {
                                my_segment = segments[segment];
                                my_segment.removeChildren(removed(my_segment));
                            }
                        });
                        this.getAnnotations(function (err, annotations) {
                            var annotation, my_annotation;
                            var removed = function (removedAnnotation) {
                                removedAnnotation.remove();
                            };
                            for (annotation = 0; annotation < annotations.length; annotation += 1) {
                                my_annotation = annotations[annotation];
                                my_annotation.removeChildren(removed(my_segment));
                            }
                        });
                        if (next) {
                            next();
                        }
                    },
                    /* Render the model's fields for sending to the user */
                    render: function () {
                        return {
                            id: this.id,
                            name: this.name,
                            created: this.created,
                            updated: this.updated,
                            location: "/location/" + this.location_id,
                            segments: "/location/" + this.location_id + "/path/" + this.id + "/segment",
                            annotations: "/location/" + this.location_id + "/path/" + this.id + "/annotation",
                            self: "/location/" + this.location_id + "/path/" + this.id
                        };
                    }
                }
            });
            /* Define the path segment table */
            models.path_segment = db.define("path_segment", {
                bearing: {
                    type: "number",
                    required: true
                },
                distance: {
                    type: "number",
                    required: true
                },
                elevation: {
                    type: "number",
                    required: true
                },
                angle_format: {
                    type: "text",
                    required: true
                },
                distance_format: {
                    type: "text",
                    required: true
                },
                created: {
                    type: "date",
                    required: false
                },
                path_id: {
                    type: "number",
                    required: true
                }
            }, {
                methods: {
                    /* Remove segment */
                    removeChildren: function (next) {
                        this.remove();
                        if (next) {
                            next();
                        }
                    },
                    /* Render the model's fields for sending to the user */
                    render: function () {
                        return {
                            id: this.id,
                            bearing: this.bearing,
                            distance: this.distance,
                            elevation: this.elevation,
                            angle_format: this.angle_format,
                            distance_format: this.distance_format,
                            created: this.created,
                            path: "/location/" + this.path.location_id + "/path/" + this.path_id,
                            self: "/location/" + this.path.location_id + "/path/" + this.path_id + "/segment/" + this.id
                        };
                    }
                }
            });
            /* Define the path annotation table */
            models.path_annotation = db.define("path_annotation", {
                start_segment_id: {
                    type: "number",
                    required: true
                },
                end_segment_id: {
                    type: "number",
                    required: true
                },
                type: {
                    type: "text",
                    required: true
                },
                message: {
                    type: "text",
                    required: true
                },
                created: {
                    type: "date",
                    required: false
                },
                path_id: {
                    type: "number",
                    required: true
                }
            }, {
                methods: {
                    /* Remove annotation */
                    removeChildren: function (next) {
                        this.remove();
                        if (next) {
                            next();
                        }
                    },
                    /* Render the model's fields for sending to the user */
                    render: function () {
                        return {
                            id: this.id,
                            start_segment: /location/ + this.path.location_id + "/path/" + this.path_id + "/segment/" + this.start_segment_id,
                            end_segment: /location/ + this.path.location_id + "/path/" + this.path_id + "/segment/" + this.end_segment_id,
                            type: this.type,
                            message: this.message,
                            created: this.created,
                            path: "/location/" + this.path.location_id + "/path/" + this.path_id,
                            self: "/location/" + this.path.location_id + "/path/" + this.path_id + "/annotation/" + this.id
                        };
                    }
                }
            });

            models.location_path.hasOne("location", models.location, {
                reverse: "paths",
                required: true,
                autoFetch: true
            });
            models.path_segment.hasOne("path", models.location_path, {
                reverse: "pathSegments",
                required: true,
                autoFetch: true
            });
            models.path_annotation.hasOne("path", models.location_path, {
                reverse: "pathAnnotations",
                required: true,
                autoFetch: true
            });
            models.path_annotation.hasOne("start_segment", models.path_segment, {
                reverse: "annotationStartSegment",
                required: true,
                autoFetch: true
            });
            models.path_annotation.hasOne("end_segment", models.path_segment, {
                reverse: "annotationEndSegment",
                required: true,
                autoFetch: true
            });

            next();
        }
    }));
};
