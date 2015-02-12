/**
 */
(function () {
    'use strict';
//
//        // test data
//    var data = [
//        {
//            "id": 1,
//            "title": "node1",
//            "nodes": [
//                {
//                    "id": 11,
//                    "title": "node1.1",
//                    "nodes": [
//                        {
//                            "id": 111,
//                            "title": "node1.1.1",
//                            "nodes": []
//                        }
//                    ]
//                }, {
//                    "id": 12,
//                    "title": "node1.2",
//                    "nodes": []
//                }
//            ]
//        },
//        {
//            "id": 2,
//            "title": "node2",
//            "nodes": [
//                {
//                    "id": 21,
//                    "title": "node2.1",
//                    "nodes": []
//                }, {
//                    "id": 22,
//                    "title": "node2.2",
//                    "nodes": []
//                }
//            ]
//        },
//        {
//            "id": 3,
//            "title": "node3",
//            "nodes": [
//                {
//                    "id": 31,
//                    "title": "node3.1",
//                    "nodes": []
//                }
//            ]
//        },
//        {
//            "id": 4,
//            "title": "node4",
//            "nodes": [
//                {
//                    "id": 41,
//                    "title": "node4.1",
//                    "nodes": []
//        }
//      ]
//  }
//];

    var links = []; // links cache

    angular
        .module('demoApp', ['ui.tree', 'ui.bootstrap'])
        .factory('treeServer', function ($http, $q) {

            return {
                apiLocation: "http://localhost:53702/api/",
                getXMLFiles: function getXMLFiles() {
                    var self = this;
                    return $q(function (resolve, reject) {
                        $http.get(self.apiLocation + "CompAgriGetXMLFiles").then(function (res) {
                            return res.data;
                        }).then(resolve, reject);
                    });
                },

                getTrees: function getTrees() {
                    return this.getXMLFiles().then(function (list) {
                        return list.map(function (item) {
                            return {
                                id: item.XmlFile_Id,
                                name: item.XmlFile_Name,
                                list: []
                            };
                        });
                    });
                },

                getTree: function getTree(xmlFileId) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        // calling the method by get
                        $http.get(self.apiLocation + 'CompAgriGetTree', {
                            params: {
                                xmlFileId: xmlFileId
                            }
                        }).then(function (response) {
                            try {
                                // the data comes parsed
                                var data = response.data;

                                // if what was left was a string (double parsing a json)
                                if (typeof data === "string") {
                                    data = JSON.parse(data);
                                }
                                // resolve the promise with the tree object
                                resolve(data);
                            } catch (e) {
                                // comes arround here if parsing fails and reject the promise with the error
                                reject(e);
                            }
                            // directly rejects the promise if $http.get fails
                        }, reject);
                    });
                },

                getConnectionsPosibleValues: function getConnectionsPosibleValues() {
                    var self = this;
                    return $q(function (resolve, reject) {
                        $http.get(self.apiLocation + "Connections/getPosibleValues").then(function (res) {
                            return res.data;
                        }).then(resolve, reject);
                    });
                },

                addConnection: function addConnection(data) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        $http.post(self.apiLocation + "Connections/Add", data).then(function (res) {
                            return res.data;
                        }).then(resolve, reject);
                    });
                },

                getConnectionsForTerms: function getConnectionsForTerms(termIds) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        $http.get(self.apiLocation + "Connections/ForTerms?termIds=" + termIds.join(',')).then(function (res) {
                            return res.data;
                        }).then(resolve, reject);
                    });
                }

            };
        })
        .controller('MainCtrl', function ($scope, $modal, treeServer, $q) {

            $scope.tabsets = [{
                id: 'left'
            }, {
                id: 'right'
            }];

            treeServer.getTrees().then(function (trees) {

                $scope.trees = trees;
            }).then(function () {
                return treeServer.getTree($scope.trees[0].id);
            }).then(function (tree) {
                $scope.trees[0].list = [tree];

                $scope._leftTree = $scope._rightTree = $scope.trees[0].id;

                $scope.newSubItem = function (scope) {
                    var nodeData = scope.$modelValue;
                    nodeData.items.push({
                        id: nodeData.id * 10 + nodeData.items.length + 1,
                        title: nodeData.title + '.' + (nodeData.items.length + 1),
                        items: []
                    });
                    $scope.redrawLines();
                };

                /**
                 * Connect nodes from different tabsets
                 */
                $scope.connect = function (scope) {
                    var $el = scope.$element;
                    $el.toggleClass('selected');

                    var parentId = $scope.getTabsetId($el);
                    $scope[parentId] = $el.hasClass('selected') ? $el : null; // remember the selected element with respect to the tree containing the element

                    var left = $scope['_left'],
                        right = $scope['_right'];

                    if (left && right) { // if there are selected items in both trees
                        var leftTree = getTree(left),
                            rightTree = getTree(right),
                            leftId = id(leftTree, left),
                            rightId = id(rightTree, right);

                        if (!findLink(leftId, rightId)) { // and there is no link between the items

                            var modalInstance = $modal.open({
                                templateUrl: 'templates/connection.modal.html',
                                controller: 'ConnectionModalCtrl',
                                scope: $scope,
                                resolve: {
                                    data: function () {
                                        return {
                                            term1: left,
                                            term2: right,
                                            leftId: leftId,
                                            rightId: rightId
                                        };
                                    }
                                }
                            });

                            modalInstance.result.then(function (data) {

                                data.Connection_Left_Term_Id = left.scope().$nodeScope.$modelValue.id;
                                data.Connection_Right_Term_Id = right.scope().$nodeScope.$modelValue.id;

                                treeServer.addConnection(data).then(function () {
                                    addLink({
                                        first: left,
                                        firstId: leftId,
                                        second: right,
                                        secondId: rightId
                                    });

                                    /*addLink({
                                        firstId: rightId,
                                        secondId: leftId
                                    });*/

                                    drawLine(left, right, false); // and draw
                                    $scope.resetConnecting(); // and clear state
                                });
                            });
                        }
                    }
                    return true;
                };

                /**
                 * Recursive function which gets the conectios form the nodes
                 */
                function getConnectionsForNodes (nodes, tree) {
                    if (nodes.length){
                        return $scope.downloadConnectionsForNodes(nodes.slice(0,5), tree).then(function () {
                            return getConnectionsForNodes(nodes.slice(5), tree);
                        });
                    }

                }

                function getConnectionForNodesChildren (nodes) {
                    return getConnectionsForNodes(nodes.reduce(function (beg, itm) {
                        return beg.concat(itm.items);
                    }, []));
                }

                /**
                 * Download the connections for the tree
                 */
                $scope.downloadConnections = function downloadConnections(tree) {
                    return getConnectionsForNodes(tree.list, tree);
                };

                /**
                 * Download the connections for the nodes and it childs
                 */
                $scope.downloadConnectionsForNodes = function downloadConnectionsForNodes(nodes, tree) {
                    return $q(function (resolve, reject) {
                        treeServer.getConnectionsForTerms(nodes.map(function(item) { return item.id })).then(function (connections) {
                            connections.forEach(function (item) {
                                addLink({
                                        firstId: item.Connection_Left_Tree_Id + ":" + item.Connection_Left_Term_Id,
                                        secondId: item.Connection_Right_Tree_Id + ":" + item.Connection_Right_Term_Id
                                    });

                                /*addLink({
                                        secondId: item.Connection_Left_Tree_Id + ":" + item.Connection_Left_Term_Id,
                                        firstId: item.Connection_Right_Tree_Id + ":" + item.Connection_Right_Term_Id
                                    });*/
                            });

                            if(connections.length) $scope.redrawLines();

                        }).then(function () {
                            return getConnectionForNodesChildren(nodes);
                        }).then(resolve, reject);
                    });
                };

                /**
                 * Clear the state if connection of nodes is aborted
                 */
                $scope.resetConnecting = function () {
                    var left = $scope['_left'];
                    var right = $scope['_right'];
                    left && left.toggleClass('selected');
                    right && right.toggleClass('selected');
                    $scope['_left'] = null;
                    $scope['_right'] = null;
                };

                /**
                 * Options of the tree which are via ui-tree attribute
                 * @type {{dragStop: Function, removed: Function}}
                 */
                $scope.treeOptions = {
                    dragStop: function () {
                        $scope.redrawLines();
                        $scope.resetConnecting();
                    },
                    removed: function (scope) {
                        var $el = scope.$element.children('.angular-ui-tree-handle:first'),
                            $tree = getTree($el);
                        removeLinks(id($tree, $el));
                        $scope.redrawLines();
                    }
                };

                /**
                 * Redraw lines after toggling visibility of child nodes
                 */
                $scope.afterToggle = function () {
                    $scope.redrawLines();
                };

                /**
                 * Remove the lines and show only relative ones
                 */
                $scope.redrawLines = function () {
                    setTimeout(function () { // async to let all the dom changes to take effect
                        $('.line').remove();
                        $('.circle').remove();
                        var l = links.length,
                            link;
                        while (l-- > 0) {
                            link = links[l];
                            if ($scope.shouldShowLink(link)) {


                                drawLine(treeVisible(link.firstId, '_left') ? getNode(link.firstId, 'left') : getNode(link.secondId, 'left'),
                                         treeVisible(link.secondId, '_right') ? getNode(link.secondId, 'right') : getNode(link.firstId, 'right'), true);
                            }
                        }
                    })
                };

                /**
                 * Indicates if a tree is visible
                 */
                function treeVisible(id, tabset) {
                    return $scope[tabset + 'Tree'] == id.split(':')[0];
                }

                /**
                 * Find if the link nodes belong two visible trees
                 */
                $scope.shouldShowLink = function (link) {

                    return link &&
                        ((treeVisible(link.firstId, '_left') && treeVisible(link.secondId, '_right')) ||
                         (treeVisible(link.firstId, '_right') && treeVisible(link.secondId, '_left')));


                };

                /**
                 * Change active tab/tree
                 * @param index tab index
                 * @param tabsetId
                 */
                $scope.select = function (index, tabsetId) {
                    $scope['_' + tabsetId + 'Tree'] = this.tree.id;

                    if (!this.tree.list || !this.tree.list.length) {
                        var tree = this.tree;
                        treeServer.getTree(tree.id).then(function (treeInfo) {
                            tree.list = [treeInfo];

                            $scope.downloadConnections(tree).then(function () {
                                $scope.redrawLines();
                            });

                            if ($scope.$$phase !== "$digest") $scope.$digest();
                        }, console.log);
                    } else {
                        $scope.redrawLines();
                    }
                };

                $scope.getTabsetId = function ($el) {
                    return '_' + $el.parents('.tabset').attr('id').replace('_tabset', '');
                };

                /**
                 * Redraw on resize
                 */
                $(window).on('resize', function () {
                    $scope.redrawLines();
                });

                $scope.downloadConnections($scope.trees[0]);
            }, console.log);

        })
        .controller('ConnectionModalCtrl', function ($scope, $modalInstance, treeServer, data) {
            $scope.pvalues = {
                "Names": [],
                "Synonyms": [],
                "TimeLimitation": [],
                "PositionLimitation": [],
                "AmountLimitation": [],
                "ClimateLimitation": [],
                "SeasonLimitation": [],
                "Measurement": []
            }

            $scope.term1 = data.term1.scope().$nodeScope.$modelValue;
            $scope.term2 = data.term2.scope().$nodeScope.$modelValue;

            treeServer.getConnectionsPosibleValues().then(function (pvalues) {
                $scope.pvalues = pvalues;

                $scope.errors = function (prop) {
                    if ($scope.validate && prop === 'Connection_Name') {
                        if (!$scope.Connection_Name)
                            $scope.errors.Connection_Name = "The Connection Name is required";
                        else
                            $scope.errors.Connection_Name = undefined;

                        return $scope.errors.Connection_Name;
                    } else if ($scope.validate && prop === 'Connection__Amount_Limitation') {
                        if ($scope.connectionForm.$error && $scope.connectionForm.$error.number)
                            $scope.errors.Connection__Amount_Limitation = "The amount limitation must be a number";
                        else
                            $scope.errors.Connection__Amount_Limitation = undefined;

                        return $scope.errors.Connection__Amount_Limitation;
                    }
                };


                $scope.saveConnection = function () {
                    $scope.validate = true;
                    if (!$scope.errors('Connection_Name') && !$scope.errors('Connection__Amount_Limitation')) {
                        $modalInstance.close({
                            Connection_Name: $scope.Connection_Name,
                            Connection_Synonym: $scope.Connection_Synonym,
                            Connection_Time_Limitation: $scope.Connection_Time_Limitation,
                            Connection_Position_Limitation: $scope.Connection_Position_Limitation,
                            Connection__Amount_Limitation: $scope.Connection__Amount_Limitation,
                            Connection_Climate_Limitation: $scope.Connection_Climate_Limitation,
                            Connection_Season_Limitation: $scope.Connection_Season_Limitation,
                            Connection_Measurement: $scope.Connection_Measurement
                        });
                    };
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss("cancel");
                };

            }, function (e) {
                $modalInstance.dismiss(e);
            });
        });

    function getTree($el) {
        return $el.parents('[data-type="tree-root"]')
    }

    function id($tree, $el) {
        return $tree.attr('id').replace('tree-root_', '') + ':' + $el.data('id')
    }

    /**
     * Get the node corresponding to the treeId and node id
     * @param id
     * @param tabsetId
     * @returns {*|jQuery}
     */
    function getNode(id, tabsetId) {
        var ids = id.split(':'),
            tree = getTreeFromId(id, tabsetId),
            node = tree.find('[data-id="' + ids[1] + '"]')
        return node;
    }

    function getTreeFromId(id, tabsetId) {
        var ids = id.split(':'),
            tree = $('#' + tabsetId + '_tabset').find('#tree-root_' + ids[0]);
        return tree;
    }

    /**
     * Add the link between items to the cache
     * @param link link
     */
    function addLink(link) {
        links.push(link);
        console.log('Connecting node [' + link.firstId + '] and [' + link.secondId + ']');
    }

    /**
     * Find if there is a link between two items and return it
     * @param firstId
     * @param secondId
     * @returns {*} a link
     */
    function findLink(firstId, secondId) {
        var l = links.length,
            link;
        while (l-- > 0) {
            link = links[l];
            if (link && link.firstId == firstId && link.secondId == secondId) {
                return link;
            }
        }
        return null;
    }

    /**
     * Removes every link that contains the element
     * @param id
     * @returns {*}
     */
    function removeLinks(id) {
        var l = links.length,
            link;
        while (l-- > 0) {
            link = links[l];
            if (link && (link.firstId == id || link.secondId == id)) {
                links[l] = null;
            }
        }
    }

    /**
     * Draw a line between two elements with two dots at the ends
     * @param _1 first jqLite/jquery element
     * @param _2 second jqLite/jquery element
     * @param jq - true if elements are jquery elements and false if jqLite elements
     */
    function drawLine(_1, _2, jq) {
        var el1 = getElement(_1, jq),
            el2 = getElement(_2, jq),
            x1 = el1.offset().left + el1.width() + 20 + 1, // + left padding + border width
            x2 = el2.offset().left,
            y1 = el1.offset().top + 20, // top padding + half of the height
            y2 = el2.offset().top + 20;

        var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate(' + angle + 'deg)';

        var line = $('<div>')
            .appendTo('body')
            .addClass('line')
            .offset({
                left: x1,
                top: y1
            })
            .css({
                'position': 'absolute',
                'transform': transform
            })
            .width(length);

        drawCircle(x1, y1);
        drawCircle(x2, y2);
    }

    /**
     * Converts first argument from jqLite array to jquery array and return it
     * or the first visible parent if the tree branch (containing the element) is collapsed
     *
     * @param _el the element
     * @param jq flag indicating that the element in jquery array (or in jqLite otherwise)
     * @returns {*}
     */
    function getElement(_el, jq) {
        var el = jq ? _el : $(_el[0]); // convert jqLite elements to jquery elements
        var collapsedParent = el.parents('[collapsed="true"]:last');
        return collapsedParent.length ? collapsedParent.children('div:first') : el;
    }

    function drawCircle(left, top) {
        var radius = 4;
        var circle = $('<div>')
            .appendTo('body')
            .addClass('circle')
            .css({
                position: 'absolute',
                "border-radius": radius + 'px',
                width: radius * 2,
                height: radius * 2
            })
            .offset({
                left: left - radius,
                top: top - radius
            });
    }

}());
