using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Configuration;
using Dapper;
using Newtonsoft.Json;

namespace TreeServer.Models.Terms
{
    /// <summary>
    /// Class to simplify access to the database
    /// </summary>
    public abstract class DatabaseTable
    {
        [JsonIgnore]
        protected static SqlConnection Database
        {
            get
            {
                return new SqlConnection(ConfigurationManager.ConnectionStrings["newDb"].ConnectionString);
            }
        }
    }
}
