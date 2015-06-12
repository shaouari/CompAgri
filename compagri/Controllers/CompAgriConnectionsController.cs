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

        [Route("All")]
        [HttpGet]
        public IEnumerable<Models.Terms.Connection> getAll()
        {
            return Models.Terms.Connection.GetAll();
        }

        [Route("get")]
        [HttpGet]
        public Models.Terms.Connection get(int id)
        {
            return Models.Terms.Connection.Find(id);
        }

        [Route("TermConnections")]
        [HttpGet]
        public IEnumerable<Models.Terms.Connection> getTermConnections(int termId)
        {
            var term = Models.Terms.Term.Find(termId);

            if(term == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            return term.GetConnections();
        }

        [Route("ForTerms")]
        [HttpGet]
        public IEnumerable<Models.Terms.Connection> getForTerms(string termIds)
        {
            if (!String.IsNullOrWhiteSpace(termIds))
                return Models.Terms.Connection.GetForTerms(termIds.Split(',').Select(t => int.Parse(t)));
            else
                return new Models.Terms.Connection[] { };
        }

        [Route("Add")]
        [HttpPost]
        public int AddConnection([FromBody] Models.Terms.Connection connection)
        {
            // This works, uncomment it when the real tree is used
            connection.Save();
            return connection.Connection_Id;
            return 0;
        }
        [Route("Delete")]
        [HttpPost]
        public int DeleteConnection([FromBody] Models.Terms.Connection connection)
        {
            connection.Delete();
            return connection.Connection_Id;
        }
    }
}
