using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Net.Http;
using System.Net;

namespace CompAgri.Controllers
{
    public class CompAgriGetTreeController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetTree(int xmlFileId)
        {
            // Get the XMLFile
            var XmlFile = Models.Terms.XMLFile.Find(xmlFileId);

            // If file not found so we return not found
            if (XmlFile == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            // We Ask the tree and return the root of the tree
            return Request.CreateResponse(HttpStatusCode.OK, XmlFile.getXMLAsTree().Root);
        }
    }

    public class CompAgriAddNodeController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage AddNode(int xmlFileId, String name, int parentId)
        {
            int res = Bll.CompAgriBll.AddNode(xmlFileId, name, parentId);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriMoveNodeController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage MoveNode(int nodeId, int oldParentId, int newParentId)
        {
            int res = 0;
            Bll.CompAgriBll.MoveNode(nodeId, oldParentId, newParentId);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriDeleteNodeController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage DeleteNode(int nodeId, int parentId)
        {
            int res = 0;
            Bll.CompAgriBll.DeleteNode(nodeId, parentId);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriGetXMLFilesController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetXMLFiles()
        {
            IEnumerable<Models.Terms.XMLFile> xmlfiles = Models.Terms.XMLFile.GetAll();


            return Request.CreateResponse<IEnumerable<Models.Terms.XMLFile>>(HttpStatusCode.OK, xmlfiles);
        }
    }



}
