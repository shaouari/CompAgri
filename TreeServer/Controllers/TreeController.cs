using Newtonsoft.Json.Linq;
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
        public int AddNode(int XmlFileId, String name, int parentId, [FromBody] JObject param)
        {
            //Debug.WriteLine("AddNode(XmlFileId: {0}, name: {1}, parentId: {2})", XmlFileId, name, parentId);
            var term = new Models.Terms.Term
            {
                Term_XmlFile_id = XmlFileId,
                Term_Title = name
            };

            term.Save();

            if (parentId != 0)
            {
                var relation = new Models.Terms.Relation()
                {
                    Relation_Parent_Term_Id = parentId,
                    Relation_Child_Term_Id = term.Term_Id
                };

                relation.Save();
            }

            if (param != null)
            {
                var propList = new List<Models.Terms.Property>();

                foreach (string prop in Models.Terms.Property.AllowedProperties)
                {
                    if (param[prop] != null)
                    {
                        propList.Add(new Models.Terms.Property
                        {
                            Property_Term_Id = term.Term_Id,
                            Property_Key = prop,
                            Property_Value = param[prop].ToString()
                        });
                    }
                }

                Models.Terms.Property.SaveMultiple(propList);

            }


            return term.Term_Id;

        }

        [Route("termDetails")]
        [HttpGet]
        public Models.TermDetails termDetails(int termId)
        {
            var term = Models.Terms.Term.Find(termId);

            if (term == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            return new Models.TermDetails(term);
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
