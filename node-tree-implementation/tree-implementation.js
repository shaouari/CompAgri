(function () {
    'use strict';

        angular.module('tree-implementation', ['ui.tree', 'ui.bootstrap'])
    // service to access to server methods
        .factory('treeServer', ['$http', '$q', function ($http, $q) {
            // all the request made from here would ask for json
            $http.defaults.headers.common.Accept = "application/json, text/plain, */*";

            return {
                // api url (when changing url, do it here)
                apiLocation: "http://localhost:55838/api/tree",
                /**
                  * gets the json fro the tree from
                  * @return angular $q promise
                  */
                getTree: function (xmlFileId) {
                    var self = this;
                    return $q(function (resolve, reject) {
                        // calling the method by get
                        $http.get(self.apiLocation + '/getTreeJson?xmlFileId=' + xmlFileId).then(function (response) {
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

                addNode: function (xmlFileId, name, parentId, data) {
                    //console.log("addNode(xmlFileId: " + xmlFileId + ", name: " + name + ", parentId: " + parentId + ", data: " + JSON.stringify(data) + ")");
                    var self = this;

                    return $q(function (resolve, reject) {
                        // calling /addNode by post
                        $http({
                            method: 'POST',
                            url: self.apiLocation + '/addNode',
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
                            url: self.apiLocation + '/deleteNode',
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
                            url: self.apiLocation + '/moveNode',
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
                        $http.get(self.apiLocation + '/termDetails?termId=' + termId).then(function (response) {
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
        }])
        .controller('home', ['treeServer', '$scope', '$modal', function (treeServer, $scope, $modal) {
            // The tre id is fixed n code meanwhile while is figured out the mecanism to set it
            $scope.xmlFileId = 30;

            treeServer.getTree($scope.xmlFileId).then(function (list) {
                // here the tree structure is set
                $scope.list = [list]; //it only return an tree, the stript ir confuguresto hadle many


                //$scope.selectedItem = {};

                // here the tree options are set
                $scope.options = {
                    dropped: function (event) { // when an node is dropped somewhere, notify to the server the action
                        treeServer.moveNode($scope.xmlFileId,
                                            // dropped item id
                                            event.source.nodeScope.$modelValue.id,
                                            // previous parent id (if it had no parent sends 0)
                                            event.source.nodesScope.$nodeScope ? event.source.nodesScope.$nodeScope.$modelValue.id : 0,
                                            // new parent id (if it has no new parent sends 0)
                                            event.dest.nodesScope.$nodeScope ? event.dest.nodesScope.$nodeScope.$modelValue.id : 0);
                    }
                };


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


                // making available to ng-click
                $scope.toggle = function (scope) {
                    scope.toggle();
                };

                // creates a new element
                var newSubItem = function (scope) {
                    var nodeData = scope.$nodeScope.$modelValue, //getting the object which the node represents
                        parentId = scope.$nodeScope.$modelValue.id,
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
                        treeServer.addNode($scope.xmlFileId,
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

                // making available the context-menu items in DOM
                $scope.contextmenu = [{
                    text: "Details", // Text to displat the menu option
                    action: function (scope) { // action to execute when clicked
                        showDetails(scope); // calls the newSubItem function
                    }
                },{
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
            }, console.log);
        }])

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


        // Add node modal form  controller
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
                treeServer.getTermDetails(termId).then(function (details) {
                    $scope.details = details;
                    
                    details.properties.forEach(function (item) {
                        item.title = propertiesNames[item.Property_Key] || item.Property_Key;
                    });
                });
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
        });

}());
