/**
 */
(function () {
    'use strict';

    var links = []; // links cache

    angular
        .module('demoApp', ['ui.tree', 'ui.bootstrap', 'ng-context-menu'])
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
                deleteConnection: function deleteConnection(id) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        $http.post(self.apiLocation + "Connections/Delete", id).then(function (res) {
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
                },

                addNode: function (xmlFileId, name, parentId, data) {
                    //console.log("addNode(xmlFileId: " + xmlFileId + ", name: " + name + ", parentId: " + parentId + ", data: " + JSON.stringify(data) + ")");
                    var self = this;

                    return $q(function (resolve, reject) {
                        // calling /addNode by post
                        $http({
                            method: 'POST',
                            url: self.apiLocation + 'CompAgriAddNode',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            params: {
                                xmlFileId: xmlFileId,
                                name: name,
                                parentId: parentId || 0
                            },

                            data: data

                        }).then(function (response) {
                            try {
                                // parse the json form the server
                                var data = response.data;

                                // resolve the promise with the new id
                                resolve(data);
                            } catch (e) {
                                // comes arround here if parsing fails and reject the promise with the error
                                reject(e);
                            }
                        }, reject); // otherwise reject

                    });
                },

                deleteNode: function (xmlFileId, nodeId, parentId) {

                    //console.log("deleteNode(xmlFileId: " + xmlFileId + ", nodeId: " + nodeId + ", parentId: " + parentId + ")");
                    var self = this;

                    return $q(function (resolve, reject) {
                        // calling /deleteNode by post
                        $http({
                            method: 'DELETE',
                            url: self.apiLocation + 'CompAgriDeleteNode',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            params: {
                                xmlFileId: xmlFileId,
                                nodeId: nodeId,
                                parentId: parentId
                            }
                        }).then(function (response) {
                            resolve();
                        }, reject);

                    });
                },

                moveNode: function (xmlFileId, nodeId, oldParentId, newParentid) {
                    //console.log("moveNode(xmlFileId: " + xmlFileId + ", nodeId: " + nodeId + ", oldParentId: " + oldParentId + ", newParentid: " + newParentid + ")");

                    var self = this;

                    return $q(function (resolve, reject) {

                        $http({
                            method: 'POST',
                            url: self.apiLocation + 'CompAgriMoveNode',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            params: {
                                xmlFileId: xmlFileId,
                                nodeId: nodeId,
                                oldParentId: oldParentId,
                                newParentid: newParentid
                            }
                        }).then(function (response) {
                            resolve();
                        }, reject);

                    });
                },

                getTermDetails: function getTermDetails(termId) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        // calling the method by get
                        $http.get(self.apiLocation + 'CompAgriTermDetails', { params: { termId: termId } }).then(function (response) {
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
                }

            };
        })

        .controller('MainCtrl', function ($scope, $modal, treeServer, $q, $compile) {

            $scope.tabsets = [{
                id: 'left'
            }, {
                id: 'right'
            }];

            $scope.deleteConnection = function (id) {
                //deleting connexion by seting the isDelete column to true
               
                treeServer.deleteConnection(id).then(function () {
                    removeLink(id);
                    $scope.redrawLines();
                    $scope.resetConnecting();
                });
                      
            };
            $scope.treeServer = treeServer;

            treeServer.getTrees().then(function (trees) {
                $scope.trees = trees;
       
            }).then(function () {
                return treeServer.getTree($scope.trees[0].id);
            }).then(function (tree) {
                $scope.trees[0].list = [tree];

                $scope._leftTree = $scope._rightTree = $scope.trees[0].id;


                var remove = function (scope) {
                    // deleting the node in the server first, then (if success) delete it in UI
                    treeServer.deleteNode($scope.xmlFileId,
                                          // node id
                                          scope.$nodeScope.$modelValue.id,
                                          // parent node id (0 if it doesn't has parent)
                                          scope.$nodeScope.$parentNodeScope ? scope.$nodeScope.$parentNodeScope.$modelValue.id : 0).then(function () {

                                              scope.remove(); // calling the node's ui-tree function to remove it;

                                          }, function (e) {
                                              // if something happened, it is handled here
                                          });
                };

                $scope.toggle = function (scope) {
                    scope.toggle();
                };

                var newSubItem = function (scope) {
                    var nodeData = scope.$nodeScope.$modelValue, //getting the object which the node represents
                        parentId = scope.$nodeScope.$modelValue.id,
                        treeId = scope.tree.id,
                        newNode = {};

                    var modalInstance = $modal.open({
                        templateUrl: 'templates/add_node_modal.html',
                        controller: 'AddNodeModalCtrl'
                    });

                    modalInstance.result.then(function (data) {
                        // If user save the info
                        newNode.title = data.DESCRIPTOR;
                        newNode.properties = data;


                        // node is added in the server first, then (if success) is added in UI
                        treeServer.addNode(treeId,
                                           data.DESCRIPTOR,
                                           // parent id (if it has one)
                                           parentId,

                                           data).then(function (newId) {
                                               //setting the id which came from server
                                               newNode.id = newId;

                                               // adding a new item
                                               nodeData.items.push(newNode);
                                           }, function (e) {
                                               // if something happened, it is handled here
                                           });
                    }, function () {
                        // User cancel the node adding
                    });
                };

                var showDetails = function showDetails(scope) {

                    var modalInstance = $modal.open({
                        templateUrl: 'templates/term_detail_modal.html',
                        controller: 'TermDetailsModalCtrl',
                        size: "lg",
                        resolve: {
                            term: function () {
                                return scope.$nodeScope.$modelValue;
                            }
                        }
                    });

                };

                $scope.contextmenu = [{
                    text: "Details", // Text to displat the menu option
                    action: function (scope) { // action to execute when clicked
                        showDetails(scope); // calls the newSubItem function
                    }
                }, {
                    text: "Add a Term", // Text to displat the menu option
                    action: function (scope) { // action to execute when clicked
                        newSubItem(scope); // calls the newSubItem function
                    }
                }, {
                    text: "Delete Term",
                    action: function (scope) {
                        remove(scope); // calls the remove function
                    }
                }];

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
                                        secondId: rightId,
                                        connectionId: data.Connection_Id
                                    });

                                    var line = drawLine(left, right, data.Connection_Id, false); // and draw

                                    $compile(line)($scope);

                                    buildContextMenu(data.Connection_Id);
                                    
                                    $scope.resetConnecting(); // and clear state
                                });
                            });
                        }
                    }
                    return true;
                };
                function buildContextMenu(id) {

                    var context = $('<div class="dropdown" style="position: fixed;z-index:999;cursor:pointer;" id="menu-' + id + '"><ul class="dropdown-menu" role="menu"><li><a class="pointer" role="menuitem" tabindex="1" ng-click="deleteConnection(' + id + ');">Delete Connection </a></li></ul></div> ');
                    context.appendTo('body');
                    $compile(context)($scope);
                }
                /**
                 * Recursive function which gets the conectios form the nodes
                 */
                function getConnectionsForNodes(nodes, tree) {
                    if (nodes.length) {
                        return $scope.downloadConnectionsForNodes(nodes.slice(0, 5), tree).then(function () {
                            return getConnectionsForNodes(nodes.slice(5), tree);
                        });
                    }

                }

                function getConnectionForNodesChildren(nodes) {
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
                        treeServer.getConnectionsForTerms(nodes.map(function (item) { return item.id })).then(function (connections) {
                            connections.forEach(function (item) {
                                    addLink({
                                        firstId: item.Connection_Left_Tree_Id + ":" + item.Connection_Left_Term_Id,
                                        secondId: item.Connection_Right_Tree_Id + ":" + item.Connection_Right_Term_Id,
                                        connectionId: item.Connection_Id
                                    });
                            });

                            if (connections.length) $scope.redrawLines();

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
                    },
                    dropped: function (event) { // when an node is dropped somewhere, notify to the server the action
                        treeServer.moveNode($scope.xmlFileId,
                                            // dropped item id
                                            event.source.nodeScope.$modelValue.id,
                                            // previous parent id (if it had no parent sends 0)
                                            event.source.nodesScope.$nodeScope ? event.source.nodesScope.$nodeScope.$modelValue.id : null,
                                            // new parent id (if it has no new parent sends 0)
                                            event.dest.nodesScope.$nodeScope ? event.dest.nodesScope.$nodeScope.$modelValue.id : null);
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


                               var line = drawLine(treeVisible(link.firstId, '_left') ? getNode(link.firstId, 'left') : getNode(link.secondId, 'left'),
                                         treeVisible(link.secondId, '_right') ? getNode(link.secondId, 'right') : getNode(link.firstId, 'right'),link.connectionId, true);
                               $compile(line)($scope);
                               buildContextMenu(link.connectionId);
                             
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


        // Add node modal form  controller
        .controller("AddNodeModalCtrl", function ($scope, $modalInstance) {

            $scope.errors = function (prop) {
                if ($scope.validate && prop === 'descriptor') {
                    if (!$scope.descriptor)
                        $scope.errors.descriptor = "The english term is required";
                    else
                        $scope.errors.descriptor = undefined;

                    return $scope.errors.descriptor;
                }
            };

            $scope.continueAdding = function () {
                $scope.validate = true;
                if (!$scope.errors('descriptor')) {
                    $modalInstance.close({
                        DESCRIPTOR: $scope.descriptor,
                        ES: $scope.es,
                        SO: $scope.so,
                        UF: $scope.uf,
                        DF: $scope.df,
                        DS: $scope.ds
                    });
                };
            };

            $scope.cancel = function () {
                $modalInstance.dismiss("cancel");
            };
        })
        .controller("UploadController", function ($scope, $http, treeServer) {
            $scope.alerts = [];
            $scope.addAlert = function (type, msg) {
                //Clear Alert Before adding another
                $scope.alerts = [];
                $scope.alerts.push({ type: type, msg: msg });
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.uploadFile = function () {
                var file = $scope.myFile;
                if (file) {
                    var fd = new FormData();
                    fd.append('file', file);
                    $http.post(treeServer.apiLocation + 'Xml/Upload', fd, {
                        transformRequest: angular.identity,
                        headers: { 'Content-Type': undefined }
                    })
                        .success(function (data) {
                            if (data) {
                                $scope.myFile = "";
                                $scope.addAlert("success", "File Uploaded Successfully");
                            }
                            else {
                                $scope.myFile = "";
                                $scope.addAlert("danger", "Unable to upload");
                            }
                        })
                        .error(function () {
                            $scope.addAlert("danger", "Error in uploading");
                        });
                }
                else {
                    $scope.addAlert("danger", "Please select file to upload");
                }
            };
        })
        .directive('fileModel', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.fileModel);
                    var modelSetter = model.assign;
                    element.bind('change', function () {
                        scope.$apply(function () {
                            modelSetter(scope, element[0].files[0]);
                        });
                    });
                    scope.$watch(attrs.fileModel, function (file) {
                        if (!file) {
                            element.val(file);
                        }
                    });
                }
            };
        })

        .controller("TermDetailsModalCtrl", function ($scope, $modalInstance, treeServer, term) {

            $scope.term = term;

            var propertiesNames = {
                DESCRIPTOR: "English Term",
                ES: "Hebrew Term",
                SO: "Source of Term",
                UF: "Used For(synonym)",
                DF: "Definition",
                DS: "Definition Source"
            };

            $scope.loadTermDetails = function loadTermDetails(termId) {
                //treeServer.getTermDetails(termId).then(function (details) {
                //    $scope.details = details;
                //
                //    details.properties.forEach(function (item) {
                //        item.title = propertiesNames[item.Property_Key] || item.Property_Key;
                //    });
                //});
            };

            $scope.loadTermDetails(term.id);

            $scope.close = function () {
                $modalInstance.dismiss("close");
            };
        })

        // creates the context directive for easier use ind DOM
        .directive('context', ['$document', '$compile', function ($document, $compile) {
            return function (scope, element, attr) {

                var menu = $compile("<context-menu-display></context-menu-display>")(scope); // creating the context-menu element to show (See directive above)
                angular.element(document.getElementsByTagName('body')[0]).append(menu); // Append it to DOM

                // close the context menu when another is open
                $document.on('contextmenu', function (event) {
                    menu.removeClass("open").addClass("closed");
                });

                // Display the menu when invoked by right clicking
                element.on('contextmenu', function (event) {
                    event.preventDefault(); // avoid the browser context menu to be open
                    event.stopPropagation(); // so it doesn't trigger the closing of the menu latter

                    // Set the menu where it was asked (rigth click position)
                    menu.css({
                        top: event.pageY + "px",
                        left: event.pageX + "px"
                    });

                    // Finally open the menu
                    menu.removeClass("closed").addClass("open");

                    // timeout because when mouse button is released, the click event is trigered closing the menu.
                    // So we give time to the user to release the button before registering the event
                    setTimeout(function () {
                        $document.one('click', function (event) {
                            menu.removeClass("open").addClass("closed");
                        });
                    }, 500);
                });

            };
        }])

        .directive('contextMenuDisplay', function () {
            return {
                replace: true,
                // No drag is necesary to avoid weird behavior
                template: "<div class='closed panel context-menu '  tab-index='1'  data-nodrag >" +
                    "<ul>" +
                    "<li ng-repeat='option in contextmenu' >" +
                    // data-option instead of ng-click because something was avoiding the ng-click
                    // event to be triggered. Registered the event manually
                    "<a  data-option='{{$index}}'>{{ option.text }}</a>" +
                    "</li></ul></div>",
                link: function (scope, element) {
                    // Whenever a click is made inside the menu, it  checks where it was made
                    element.on('click', function (e) {
                        // If it was made inside an "<a>" element, so a option was selected
                        if (e.target.tagName.toLowerCase() === "a") {

                            var $this = angular.element(e.target);
                            // We pick the option index in the context menu and trigger the proper action
                            scope.contextmenu[$this.attr("data-option")].action(scope);
                        }
                    });
                }
            };
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
     * remove  link between items to the cache
     * @param link link
     */
    function removeLink(id) {
        var newLinks = [];
        links.forEach(function (l) {
            if (l.connectionId != id) {
                newLinks.push(l);
            }
        })
        links = angular.copy(newLinks);
      
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
    function drawLine(_1, _2,id ,jq) {
        var el1 = getElement(_1, jq),
            el2 = getElement(_2, jq),
            x1 = el1.offset().left + el1.width() + 20 + 1, // + left padding + border width
            x2 = el2.offset().left,
            y1 = el1.offset().top + 20, // top padding + half of the height
            y2 = el2.offset().top + 20;

        var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        var transform = 'rotate(' + angle + 'deg)';

        var line = $('<div context-menu data-target="menu-' + id + '">')
            .appendTo('body > .container')
            .addClass('line')
            .css({
                'position': 'absolute',
                'transform': transform
            })
            .offset({
                left: x1,
                top: y1
            })
            .attr("id",id)
            .width(length);

        
            
        drawCircle(x1, y1);
        drawCircle(x2, y2);
        return line;
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
