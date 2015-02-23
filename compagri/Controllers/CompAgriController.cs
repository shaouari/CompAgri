using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Net.Http;
using System.Net;
using Newtonsoft.Json.Linq;

namespace CompAgri.Controllers
{
    public class CompAgriGetTreeController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage GetTree(int xmlFileId)
        {
            var res = Bll.CompAgriBll.GetTree(xmlFileId);

            if (res == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            return Request.CreateResponse(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriAddNodeController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage AddNode(int xmlFileId, String name, int parentId, [FromBody] JObject param)
        {
            int res = Bll.CompAgriBll.AddNode(xmlFileId, name, parentId, param);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriMoveNodeController : ApiController
    {
        [HttpPost]
        public HttpResponseMessage MoveNode(int nodeId, int? oldParentId, int? newParentId)
        {
            int res = 0;
            Bll.CompAgriBll.MoveNode(nodeId, oldParentId, newParentId);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriDeleteNodeController : ApiController
    {
        [HttpDelete]
        public HttpResponseMessage DeleteNode(int nodeId, int parentId)
        {
            int res = 0;
            Bll.CompAgriBll.DeleteNode(nodeId, parentId);
            return Request.CreateResponse<int>(HttpStatusCode.OK, res);
        }
    }

    public class CompAgriTermDetailsController : ApiController
    {
        [HttpGet]
        public HttpResponseMessage TermDetails(int termId)
        {
            var res = Bll.CompAgriBll.TermDetails(termId);
            return Request.CreateResponse(HttpStatusCode.OK, res);
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
