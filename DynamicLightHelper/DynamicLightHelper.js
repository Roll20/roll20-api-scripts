/*global _, on, createObj, getObj, log, state, findObjs, filterObjs, sendChat, playerIsGM */
/*jslint browser: true, multivar: true, bitwise: true, es6: true */
var Dynamic_Light_Helper = Dynamic_Light_Helper || (function () {
    "use strict";

// SETTINGS <===================================================
    const CON = {
        SCRIPT: "Dynamic_Light_Helper",
        VERSION: 2.0,
        UPDATE: 1476712215,
        SCHEMA: 2.0,
        PATH_DFLT: {
            stroke_width: 3,
            stroke: "#FF0000"
        },
        IMGSRC_CREATE: "https://s3.amazonaws.com/files.d20.io/images/24139904/KpzIsdelTUcuqcWtt6WNhg/thumb.png?1476399686",//Must be different from default
        CNTL_DFLT: {
            layer: "objects",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/24139885/Rn1TpFeWyHufeaIwCxyHHw/thumb.png?1476399646",//Must be different from create
            width: 28,
            height: 28,
            isdrawing: true,
            showname: false,
            tint_color: "transparent",
            make_empty: ["bar1_max", "bar2_max", "bar3_max", "aura1_radius", "aura2_radius", "statusmarkers", "light_radius"]
        }
    };
// SETTINGS <===================================================

// GLOBAL <=====================================================
    var defaults,
        page_status = {},
        id_index = {},
        chat_template = _.template(
            "/w GM <div style=\"padding:1px 3px; border: 1px solid <%=border%>; background: <%=background%>; color: <%=color%>; font-size: 80%;\">"
            + "<img src=\"<%=src%>\" style=\"vertical-align: text-bottom; width:20px; height:20px; padding: 0px 5px;\"/><%=text%><br><br>"
            + "<a href=\"<%=command%>\" style=\"padding:0px 0px;border: 0px; border-collapse: collapse; color: <%=color%>; font-size: 100%; "
            + "background: <%=background%>;\"><span style=\"color: <%=color%>; font-size: 80%;\"><b><%=commandText%></b></span></a></div>"
        ),
// GLOBAL <=====================================================

// UTILITY <====================================================
        simple_object = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        snap_distance = function (distance, unit) {
            return (~~((~~distance) / unit) * unit) + (unit / 2);
        },
        create_point = function (props) {
            return createObj("graphic", _.defaults(props, defaults));
        },
        add_to_index = function (props) {
            _.each(props.path, function (e) {
                id_index[e] = {
                    pageid: props.pageid,
                    orignpathid: props.orignpathid
                };
            });
        },
        create_dynamic_state = function (props) {
            if (!_.has(state[CON.SCRIPT].dynamic, props.pageid)) {
                state[CON.SCRIPT].dynamic[props.pageid] = {};
            }
            state[CON.SCRIPT].dynamic[props.pageid][props.orignpathid] = props;
            add_to_index(props);
        },
        create_path = function (props) {
            createObj("path", _.extend(props, {layer: "gmlayer"}));
            createObj("path", _.extend(props, {layer: "walls"}));
        },
        remove_old_path = function (controlledby, removeall) {
            _.each(findObjs({type: "path", controlledby: controlledby}), function (e) {
                if (removeall) {
                    e.remove();
                } else {
                    if ("gmlayer" === e.get("layer")) {
                        e.remove();
                    }
                }
            });
        },
        remove_control = function (dynamic) {
            var node;
            _.each(dynamic.path, function (e) {
                node = getObj("graphic", e);
                if (node) {
                    node.remove();
                }
            });
            remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, true);
            delete state[CON.SCRIPT].dynamic[dynamic.pageid][dynamic.orignpathid];
        },
        get_box_bound = function (path) {
            var minx = 0, miny = 0, maxx = 0, maxy = 0;
            _.each(path, function (e) {
                minx = Math.min(minx, e[1]);
                miny = Math.min(miny, e[2]);
                maxx = Math.max(maxx, e[1]);
                maxy = Math.max(maxy, e[2]);
            });
            return {x1: minx, y1: miny, x2: maxx, y2: maxy, xc: (maxx / 2), yc: (maxy / 2), w: maxx, h: maxy};
        },
// UTILITY <====================================================

// MENU <=======================================================
        help_menu = function () {
            sendChat(CON.SCRIPT, chat_template({
                border: "#00529B",
                background: "#BDE5F8",
                color: "#00529B",
                src: "https://s3.amazonaws.com/files.d20.io/images/6422881/TSnHqUi-Y3TjRjqM1P_GsQ/thumb.png",
                text: "<b>Dynamic Light Helper</b><br><br>Set the page options as follows: \"Grid Type\" set to \"Square\" "
                        + "and \"check\" \"show labels\" to enter \"edit mode\". <br><br>While on the \"objects\" layer, use the drawing "
                        + "tools to draw your dyamic lighting lines. <br><br>The script will provide edit controls on the \"objects\" layer "
                        + "and draw dynamic path lines on the \"walls\" layer along with visible aid lines on the \"gmlayer\" (the orignal paths "
                        + "will be removed)<br><br>\"Unchecking\" the \"show labels\" exists edit mode (removing the controls and \"gmlayer\" paths.) "
                        + "<br><br>You can toggle in and out of edit mode as often as you like.<br><br>You can also use the API command of \"!"
                        + CON.SCRIPT + "\" to quickly toggle this status for any page.",
                command: "!" + CON.SCRIPT + " hidehelp",
                commandText: "Do not show this again."
            }));
        },
// MENU <=======================================================

// POLY PATH <==================================================
        poly_path = (function () {
            var update = function (dynamic) {
                    var node_a, node_b, minx, miny;
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, true);
                    _.each(dynamic.path, function (e, i) {
                        if (i < (dynamic.path.length - 1)) {
                            node_a = getObj("graphic", e);
                            node_b = getObj("graphic", dynamic.path[i + 1]);
                            if (!node_a || !node_b) {
                                remove_control(dynamic);
                                return;
                            }
                            minx = Math.min(node_a.get("left"), node_b.get("left"));
                            miny = Math.min(node_a.get("top"), node_b.get("top"));
                            create_path({
                                pageid: node_a.get("pageid"),
                                left: (node_a.get("left") + node_b.get("left")) / 2,
                                top: (node_a.get("top") + node_b.get("top")) / 2,
                                width: Math.abs(node_a.get("left") - node_b.get("left")),
                                height: Math.abs(node_a.get("top") - node_b.get("top")),
                                stroke_width: CON.PATH_DFLT.stroke_width,
                                stroke: CON.PATH_DFLT.stroke,
                                path: "["
                                        + "[\"M\", " + (node_a.get("left") - minx) + ", " + (node_a.get("top") - miny) + "], "
                                        + "[\"L\", " + (node_b.get("left") - minx) + ", " + (node_b.get("top") - miny) + "]]",
                                controlledby: dynamic.pageid + "|" + dynamic.orignpathid
                            });
                        }
                    });
                },
                unhide = function (dynamic) {
                    var node, node_path = [], first;
                    _.each(dynamic.path, function (e, i) {
                        if ("closed" !== e) {
                            node = create_point({
                                pageid: dynamic.pageid,
                                imgsrc: CON.IMGSRC_CREATE,
                                left: snap_distance(e[0], 14),
                                top: snap_distance(e[1], 14)
                            }).id;
                            if (0 === i) {
                                first = node;
                            }
                            node_path.push(node);
                        } else {
                            node_path.push(first);
                        }
                    });
                    create_dynamic_state({type: "poly", pageid: dynamic.pageid, orignpathid: dynamic.orignpathid, path: node_path});
                    update(state[CON.SCRIPT].dynamic[dynamic.pageid][dynamic.orignpathid]);
                },
                hide = function (dynamic) {
                    var node, closed = (dynamic.path[0] === dynamic.path[dynamic.path.length - 1]), newpath = [];
                    _.each(dynamic.path, function (e, i) {
                        if (!closed || (closed && i < (dynamic.path.length - 1))) {
                            node = getObj("graphic", e);
                            if (node) {
                                delete id_index[node.id];
                                newpath.push([node.get("left"), node.get("top")]);
                                node.remove();
                            }
                        } else {
                            newpath.push("closed");
                        }
                    });
                    state[CON.SCRIPT].dynamic[dynamic.pageid][dynamic.orignpathid].path = newpath;
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, false);
                },
                create = function (parsed_path) {
                    var node = [];
                    _.each(parsed_path.path_data, function (e, i) {
                        if (!parsed_path.is_closed || (parsed_path.is_closed && i < (parsed_path.path_data.length - 1))) {
                            node.push(create_point({
                                pageid: parsed_path.pageid,
                                imgsrc: CON.IMGSRC_CREATE,
                                left: snap_distance(parsed_path.left - (parsed_path.box_bound.w / 2) + e[1], 14),
                                top: snap_distance(parsed_path.top - (parsed_path.box_bound.h / 2) + e[2], 14)
                            }).id);
                        }
                    });
                    if (parsed_path.is_closed) {
                        node.push(node[0]);
                    }
                    create_dynamic_state({type: "poly", pageid: parsed_path.pageid, orignpathid: parsed_path.orignpathid, path: node});
                    update(state[CON.SCRIPT].dynamic[parsed_path.pageid][parsed_path.orignpathid]);
                };
            return {
                create: create,
                update: update,
                hide: hide,
                unhide: unhide
            };
        }()),
// POLY PATH <==================================================

// FREE HAND <==================================================
        free_path = (function () {
            var create = function (parsed_path) {
                var snap_path = [], last_point = [], current_point;
                _.each(parsed_path.path_data, function (e, i) {
                    current_point = ["F", snap_distance(e[1], 14), snap_distance(e[2], 14)];
                    if (0 === i) {
                        snap_path.push(current_point);
                        last_point = current_point;
                    } else {
                        if (((last_point[0] !== current_point[0]) || (last_point[1] !== current_point[1])) && (Math.abs(i % 3) === 1)) {
                            snap_path.push(current_point);
                            last_point = current_point;
                        }
                    }
                });
                poly_path.create({
                    type: "poly",
                    is_closed: false,
                    path_data: snap_path,
                    box_bound: parsed_path.box_bound,
                    orignpathid: parsed_path.orignpathid,
                    pageid: parsed_path.pageid,
                    left: parsed_path.left,
                    top: parsed_path.top,
                    orign_path: parsed_path.orign_path
                });
            };
            return {
                create: create
            };
        }()),
// FREE HAND <==================================================

// BOX PATH <===================================================
        box_path = (function () {
            var get_nodes = function (dynamic) {
                    var node1 = getObj("graphic", dynamic.path[0]),
                        node2 = getObj("graphic", dynamic.path[1]);
                    if (!node1 || !node2) {
                        remove_control(dynamic);
                        return;
                    }
                    return {one: node1, two: node2};
                },
                update = function (dynamic) {
                    var node = get_nodes(dynamic);
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, true);
                    create_path({
                        pageid: node.one.get("pageid"),
                        left: (node.one.get("left") + node.two.get("left")) / 2,
                        top: (node.one.get("top") + node.two.get("top")) / 2,
                        width: Math.abs(node.one.get("left") - node.two.get("left")),
                        height: Math.abs(node.one.get("top") - node.two.get("top")),
                        stroke_width: CON.PATH_DFLT.stroke_width,
                        stroke: CON.PATH_DFLT.stroke,
                        path: "["
                                + "[\"M\", 0, 0], "
                                + "[\"L\", " + Math.abs(node.one.get("left") - node.two.get("left")) + ", 0], "
                                + "[\"L\", " + Math.abs(node.one.get("left") - node.two.get("left")) + ", "
                                + Math.abs(node.one.get("top") - node.two.get("top")) + "], "
                                + "[\"L\", 0, " + Math.abs(node.one.get("top") - node.two.get("top")) + "], "
                                + "[\"L\", 0, 0]"
                                + "]",
                        controlledby: dynamic.pageid + "|" + dynamic.orignpathid
                    });
                },
                create_nodes = function (props) {
                    var node1 = create_point({pageid: props.pageid, imgsrc: CON.IMGSRC_CREATE, left: props.aLeft, top: props.aTop}),
                        node2 = create_point({pageid: props.pageid, imgsrc: CON.IMGSRC_CREATE, left: props.bLeft, top: props.bTop});
                    create_dynamic_state({type: "box", pageid: props.pageid, orignpathid: props.orignpathid, path: [node1.id, node2.id]});
                    update(state[CON.SCRIPT].dynamic[props.pageid][props.orignpathid]);
                },
                unhide = function (dynamic) {
                    create_nodes({
                        pageid: dynamic.pageid,
                        aLeft: snap_distance(dynamic.path[0][0], 14),
                        aTop: snap_distance(dynamic.path[0][1], 14),
                        bLeft: snap_distance(dynamic.path[1][0], 14),
                        bTop: snap_distance(dynamic.path[1][1], 14),
                        orignpathid: dynamic.orignpathid
                    });
                },
                hide = function (dynamic) {
                    var node = get_nodes(dynamic);
                    delete id_index[node.one.id];
                    delete id_index[node.two.id];
                    state[CON.SCRIPT].dynamic[dynamic.pageid][dynamic.orignpathid].path = [
                        [node.one.get("left"), node.one.get("top")],
                        [node.two.get("left"), node.two.get("top")]
                    ];
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, false);
                    node.one.remove();
                    node.two.remove();
                },
                create = function (parsed_path) {
                    create_nodes({
                        pageid: parsed_path.pageid,
                        aLeft: snap_distance(parsed_path.left - (parsed_path.box_bound.w / 2), 14),
                        aTop: snap_distance(parsed_path.top - (parsed_path.box_bound.h / 2), 14),
                        bLeft: snap_distance(parsed_path.left + (parsed_path.box_bound.w / 2), 14),
                        bTop: snap_distance(parsed_path.top + (parsed_path.box_bound.h / 2), 14),
                        orignpathid: parsed_path.orignpathid
                    });
                };
            return {
                create: create,
                update: update,
                hide: hide,
                unhide: unhide
            };
        }()),
// BOX PATH <===================================================

// CIRCLE <=============================+++=====================
        circle_path = (function () {
            var get_nodes = function (dynamic) {
                    var node1 = getObj("graphic", dynamic.path[0]),
                        node2 = getObj("graphic", dynamic.path[1]);
                    if (!node1 || !node2) {
                        remove_control(dynamic);
                        return;
                    }
                    return {one: node1, two: node2};
                },
                update = function (dynamic) {
                    var node = get_nodes(dynamic),
                        theta = 0,
                        xc = node.one.get("left"),
                        yc = node.two.get("top"),
                        w = Math.abs(node.one.get("left") - node.two.get("left")) * 2,
                        h = Math.abs(node.one.get("top") - node.two.get("top")) * 2,
                        step = 5,
                        path = "[[\"M\",";
                    while (theta < 360 + step) {
                        path = path + ((w / 2) * Math.cos(theta * (Math.PI / 180)) + (w / 2)) + ",";
                        path = path + ((h / 2) * Math.sin(theta * (Math.PI / 180)) + (h / 2)) + "]";
                        theta = theta + step;
                        if (theta < 360 + step) {
                            path = path + ",[\"L\",";
                        }
                        theta = theta + step;
                    }
                    path = path + "]";
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, true);
                    create_path({
                        pageid: node.one.get("pageid"),
                        left: xc,
                        top: yc,
                        width: w,
                        height: h,
                        stroke_width: CON.PATH_DFLT.stroke_width,
                        stroke: CON.PATH_DFLT.stroke,
                        path: path,
                        controlledby: dynamic.pageid + "|" + dynamic.orignpathid
                    });
                },
                create_nodes = function (props) {
                    var node1 = create_point({pageid: props.pageid, imgsrc: CON.IMGSRC_CREATE, left: props.aLeft, top: props.aTop}),
                        node2 = create_point({pageid: props.pageid, imgsrc: CON.IMGSRC_CREATE, left: props.bLeft, top: props.bTop});
                    create_dynamic_state({type: "circle", pageid: props.pageid, orignpathid: props.orignpathid, path: [node1.id, node2.id]});
                    update(state[CON.SCRIPT].dynamic[props.pageid][props.orignpathid]);
                },
                unhide = function (dynamic) {
                    create_nodes({
                        pageid: dynamic.pageid,
                        aLeft: snap_distance(dynamic.path[0][0], 14),
                        aTop: snap_distance(dynamic.path[0][1], 14),
                        bLeft: snap_distance(dynamic.path[1][0], 14),
                        bTop: snap_distance(dynamic.path[1][1], 14),
                        orignpathid: dynamic.orignpathid
                    });
                },
                hide = function (dynamic) {
                    var node = get_nodes(dynamic);
                    delete id_index[node.one.id];
                    delete id_index[node.two.id];
                    state[CON.SCRIPT].dynamic[dynamic.pageid][dynamic.orignpathid].path = [
                        [node.one.get("left"), node.one.get("top")],
                        [node.two.get("left"), node.two.get("top")]
                    ];
                    remove_old_path(dynamic.pageid + "|" + dynamic.orignpathid, false);
                    node.one.remove();
                    node.two.remove();
                },
                create = function (parsed_path) {
                    create_nodes({
                        pageid: parsed_path.pageid,
                        aLeft: snap_distance(parsed_path.left, 14),
                        aTop: snap_distance(parsed_path.top - (parsed_path.box_bound.h / 2), 14),
                        bLeft: snap_distance(parsed_path.left + (parsed_path.box_bound.w / 2), 14),
                        bTop: snap_distance(parsed_path.top, 14),
                        orignpathid: parsed_path.orignpathid
                    });
                };
            return {
                create: create,
                update: update,
                hide: hide,
                unhide: unhide
            };
        }()),
// CIRCLE <=============================+++=====================

// PATH PARSING <===============================================
        parse_point = function (raw_point) {
            var point = [];
            _.each(raw_point.split(","), function (f, i) {
                point.push(
                    (0 === i)
                        ? f.replace(/^"(.*)"$/, "$1")
                        : +f.replace(/^"(.*)"$/, "$1")
                );
            });
            return point;
        },
        parse_path = function (path) {
            var path_data = [], parsed_path = {};
            _.each(path.get("path").slice(2, -2).split("],["), function (e) {
                path_data.push(parse_point(e));
            });
            parsed_path = {
                type: (path_data[1][0] === "C")
                    ? "circle"
                    : (path_data[1][0] === "Q")
                        ? "freehand"
                        : ((path_data.length === 5) && (path_data[2][1] === path_data[1][1]) && (path_data[3][2] === path_data[2][2])
                                && ((path_data[0][1] + path_data[0][2] + path_data[1][2] + path_data[3][1] + path_data[4][1] + path_data[4][2]) === 0))
                            ? "box"
                            : "poly",
                is_closed: ((path_data[0][1] === path_data[path_data.length - 1][1]) && (path_data[0][2] === path_data[path_data.length - 1][2])),
                path_data: path_data,
                box_bound: get_box_bound(path_data),
                orignpathid: path.id,
                pageid: path.get("pageid"),
                left: path.get("left"),
                top: path.get("top"),
                orign_path: simple_object(path)
            };
            path.remove();
            switch (parsed_path.type) {
            case "box":
                box_path.create(parsed_path);
                return;
            case "poly":
                poly_path.create(parsed_path);
                return;
            case "freehand":
                free_path.create(parsed_path);
                return;
            case "circle":
                circle_path.create(parsed_path);
                return;
            }
        },
        update_graphic = function (graphic) {
            var dynamic_object;
            dynamic_object = state[CON.SCRIPT].dynamic[id_index[graphic.id].pageid][id_index[graphic.id].orignpathid];
            switch (dynamic_object.type) {
            case "box":
                box_path.update(dynamic_object);
                return;
            case "poly":
                poly_path.update(dynamic_object);
                return;
            case "circle":
                circle_path.update(dynamic_object);
                return;
            }
        },
// PATH PARSING <===============================================

// EVENT ACTIONS <=========================================+++++
        page_status_change = function (pageid) {
            _.each(state[CON.SCRIPT].dynamic[pageid], function (e) {
                switch (e.type) {
                case "box":
                    if (page_status[pageid]) {
                        box_path.unhide(e);
                    } else {
                        box_path.hide(e);
                    }
                    return;
                case "poly":
                    if (page_status[pageid]) {
                        poly_path.unhide(e);
                    } else {
                        poly_path.hide(e);
                    }
                    return;
                case "circle":
                    if (page_status[pageid]) {
                        circle_path.unhide(e);
                    } else {
                        circle_path.hide(e);
                    }
                    return;
                }
            });
        },
        destroy_control = function (graphic) {
            var dynamic_object;
            dynamic_object = state[CON.SCRIPT].dynamic[id_index[graphic.id].pageid][id_index[graphic.id].orignpathid];
            switch (dynamic_object.type) {
            case "box":
                remove_control(dynamic_object);
                return;
            case "poly":
                remove_control(dynamic_object);
                return;
            case "circle":
                remove_control(dynamic_object);
                return;
            }
        },
        change_control = function (graphic) {
            graphic.set(_.defaults({
                left: snap_distance(graphic.get("left"), 14),
                top: snap_distance(graphic.get("top"), 14),
                rotation: 0
            }, defaults));
            update_graphic(graphic);
        },
// EVENT ACTIONS <=========================================+++++

// EVENTS <=====================================================
        event_destroy_graphic = function (graphic) {
            if (!_.has(id_index, graphic.id) || !_.has(state[CON.SCRIPT].dynamic, id_index[graphic.id].pageid)) {
                return;
            }
            destroy_control(graphic);
        },
        event_change_graphic = function (graphic) {
            if (CON.IMGSRC_CREATE === graphic.get("imgsrc")) {
                graphic.set("imgsrc", CON.CNTL_DFLT.imgsrc);
                return;
            }
            if (!_.has(id_index, graphic.id) || !_.has(state[CON.SCRIPT].dynamic, id_index[graphic.id].pageid)) {
                return;
            }
            change_control(graphic);
        },
        event_add_path = function (path) {
            if ((page_status[path.get("pageid")] === true) && (path.get("layer") === "objects")) {
                parse_path(path);
            }
        },
        event_change_page_gridlabels = function (page) {
            page_status[page.id] = ((page.get("grid_type") === "square") && (page.get("gridlabels") === true));
            page_status_change(page.id);
        },
        event_chat_message = function (msg_orig) {
            var msg = _.clone(msg_orig),
                arg = msg.content.split(" "),
                player,
                page;
            if (msg.type !== "api" || !playerIsGM(msg.playerid) || arg[0] !== ("!" + CON.SCRIPT)) {
                return;
            }
            player = getObj("player", msg.playerid);
            if (player) {
                page = getObj("page", player.get("lastpage"));
                if (page) {
                    switch (arg[1]) {
                    case "hidehelp":
                        state[CON.SCRIPT].options.help = false;
                        sendChat(CON.SCRIPT, chat_template({
                            border: "#00529B",
                            background: "#BDE5F8",
                            color: "#00529B",
                            src: "https://s3.amazonaws.com/files.d20.io/images/6422881/TSnHqUi-Y3TjRjqM1P_GsQ/thumb.png",
                            text: "<b>Dynamic Light Helper</b><br><br>Help noticed turned off",
                            command: "!" + CON.SCRIPT + " showhelp",
                            commandText: "Restore help on startup."
                        }));
                        return;
                    case "showhelp":
                        state[CON.SCRIPT].options.help = true;
                        help_menu();
                        return;
                    }
                    page.set({
                        grid_type: "square",
                        gridlabels: !page.get("gridlabels")
                    });
                }
                event_change_page_gridlabels(page);
            }
        },
// EVENTS <=====================================================

// READY <======================================================
        ready_page_status = function () {
            _.each(findObjs({type: "page"}), function (page) {
                page_status[page.id] = ((page.get("grid_type") === "square") && (page.get("gridlabels") === true));
            });
        },
        ready_defaults = function () {
            defaults = _.omit(CON.CNTL_DFLT, "make_empty");
            _.each(CON.CNTL_DFLT.make_empty, function (make_empty) {
                defaults[make_empty] = "";
            });
        },
        ready_state = function () {
            log("-=> " + CON.SCRIPT + " v" + CON.VERSION + " <=- [" + (new Date(CON.UPDATE * 1000)) + "]");
            state[CON.SCRIPT] = (!_.has(state, CON.SCRIPT) || (state[CON.SCRIPT].version !== CON.SCHEMA))
                ? {version: CON.SCHEMA, dynamic: {}, options: {}}
                : state[CON.SCRIPT];
            _.each(_.difference(_.keys(state[CON.SCRIPT].dynamic), _.keys(_.indexBy(simple_object(findObjs({type: "page"})), "_id"))), function (e) {
                delete state[CON.SCRIPT].dynamic[e];
            });
            _.each(_.keys(state[CON.SCRIPT].dynamic), function (e) {
                _.each(_.keys(state[CON.SCRIPT].dynamic[e]), function (f) {
                    _.each(state[CON.SCRIPT].dynamic[e][f].path, function (g) {
                        if (_.isString(g)) {
                            add_to_index(state[CON.SCRIPT].dynamic[e][f]);
                        }
                    });
                });
            });
            if (!_.has(state[CON.SCRIPT].options, "installed")) {
                log("  > Updating Schema to v" + CON.SCHEMA + " <");
                state[CON.SCRIPT].options.installed = true;
                state[CON.SCRIPT].options.help = true;
            } else {
                log("  > Refreshing stored values <");
            }
            log("-=> '!" + CON.SCRIPT + " showhelp' <=-");
        },
        ready_script = function () {
            ready_state();
            ready_defaults();
            ready_page_status();
            on("add:path", event_add_path);
            on("change:page:gridlabels", event_change_page_gridlabels);
            on("change:graphic", event_change_graphic);
            on("destroy:graphic", event_destroy_graphic);
            on("chat:message", event_chat_message);
            if (state[CON.SCRIPT].options.help) {
                help_menu();
            }
        };
// READY <======================================================

    return {
        ready_script: ready_script
    };

}());

on("ready", function () {
    "use strict";

    Dynamic_Light_Helper.ready_script();
});