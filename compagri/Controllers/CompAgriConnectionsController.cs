using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace CompAgri.Controllers
{
    [RoutePrefix("api/Connections")]
    public class CompAgriConnectionsController : ApiController
    {
        [Route("getPosibleValues")]
        [HttpGet]
        public Models.Terms.Connection.PosibleValues getPosibleValues()
        {
            return Models.Terms.Connection.GetPosibleValues();
        }
    }
}
