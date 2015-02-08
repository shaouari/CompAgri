using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace CompAgri.Models.Tree
{
    /// <summary>
    /// Represents a tree
    /// </summary>
    /// <typeparam name="T">The data type the nodes are going to store</typeparam>
    public class Tree<T> where T : class
    {
        /// <summary>
        /// Creates a tree with an empty Root
        /// </summary>
        public Tree()
        {
            Root = new RootClass();
        }

        /// <summary>
        /// Creates a tree with its root
        /// </summary>
        /// <param name="id">Id of the root</param>
        /// <param name="title">Title of the node</param>
        /// <param name="data">Data for the node</param>
        public Tree(string id, string title, T data = null)
        {
            Root = new RootClass
            {
                id = id,
                title = title,
                data = data
            };
        }


        /// <summary>
        /// Root of the Tree
        /// </summary>
        public RootClass Root { get; set; }

        /// <summary>
        /// Represents a Node of the Tree
        /// </summary>
        public class NodeClass
        {
            /// <summary>
            /// Reference the parent of the node
            /// </summary>
            [JsonIgnore]
            [XmlIgnore]
            virtual internal NodeClass Parent { get; set; }

            public string id;

            public string title;

            public List<NodeClass> items = new List<NodeClass>();

            public T data;

            /// <summary>
            /// Ads a child node to this node
            /// </summary>
            /// <param name="id">The id if the new node</param>
            /// <param name="title">The new title for the new node</param>
            /// <param name="data">The data for the new node</param>
            /// <returns></returns>
            public NodeClass addChild(string id, string title, T data = null)
            {
                return addChild(new NodeClass
                {
                    id = id,
                    title = title,
                    data = data
                });
            }

            /// <summary>
            /// Ads a child node to this node
            /// </summary>
            /// <param name="child">The new child</param>
            /// <returns></returns>
            public NodeClass addChild(NodeClass child)
            {
                items.Add(child);
                child.Parent = this;
                return this;
            }
        }

        /// <summary>
        /// Reprecents the root of the node
        /// </summary>
        public class RootClass : NodeClass
        {
        }
    }
}
