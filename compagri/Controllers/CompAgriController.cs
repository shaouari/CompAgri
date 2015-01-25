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
            // The best is to return a tree structure, because the controller parses the response to the asked type anyway
            string res = "[{\"id\": 1, \"title\": \"1. dragon-breath\", \"items\": []}, {\"id\": 2, \"title\": \"2. moiré-vision\", \"items\": [{ \"id\": 21, \"title\": \"2.1. tofu-animation\", \"items\": [{ \"id\": 211, \"title\": \"2.1.1. spooky-giraffe\", \"items\": []}, {\"id\": 212, \"title\": \"2.1.2. bubble-burst\", \"items\": [] }] }, {\"id\": 22, \"title\": \"2.2. barehand-atomsplitting\", \"items\": []}]}, {\"id\": 3, \"title\": \"3. unicorn-zapper\", \"items\": []}, {\"id\": 4, \"title\": \"4. romantic-transclusion\", \"items\": []}]";
            //string res = "EFI";
            return Request.CreateResponse<string>(HttpStatusCode.OK, res);
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



}