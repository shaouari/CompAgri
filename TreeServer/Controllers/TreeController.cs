using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace TreeServer.Controllers
{
    [RoutePrefix("api/tree")]
    public class TreeController : ApiController
    {
        [Route("addNode")]
        public int AddNode(int XmlFileId, String name, int parentId)
        {
            Debug.WriteLine("AddNode(XmlFileId: {0}, name: {1}, parentId: {2})", XmlFileId, name, parentId);

            var newId = new Random().Next(10000000);

            Debug.WriteLine("Returns {0}", newId);

            return newId;

        }

        [Route("deleteNode")]
        public void DeleteNode(int nodeId, int parentId)
        {
            Debug.WriteLine("DeleteNode(nodeId: {0}, parentId: {1})", nodeId, parentId);
        }

        [Route("moveNode")]
        public void MoveNode(int nodeId, int oldParentId, int newParentId)
        {
            Debug.WriteLine("MoveNode(nodeId: {0}, oldParentId: {1}, newParentId: {2})", nodeId, oldParentId, newParentId);
        }

        [Route("")]
        [Route("getTreeJson")]
        public Models.Tree.Tree<Models.Terms.Term>.RootClass getTreeJson(int xmlFileId)
        {
            // Get the XMLFile
            var XmlFile = Models.Terms.XMLFile.Find(xmlFileId);

            // If file not found so we return not found
            if (XmlFile == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // We Ask the tree and return the root of the tree
            return XmlFile.getXMLAsTree().Root;
        }

    }
}
