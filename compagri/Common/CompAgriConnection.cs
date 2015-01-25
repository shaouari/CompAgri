using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Configuration;

namespace CompAgri.Common
{
    public class CompAgriConnection : DbContext
    {
        #region Declarations

        public static string BaseConnectionString { get { return ConfigurationManager.ConnectionStrings["edenerez_xmldbEntities"].ToString(); } }

        #endregion

        public CompAgriConnection()
            : base(BaseConnectionString)
        {
            Database.SetInitializer<CompAgriConnection>(null);
        }

        public virtual DbSet<Property> Properties { get; set; }
        public virtual DbSet<Relation> Relations { get; set; }
        public virtual DbSet<Term> Terms { get; set; }
        public virtual DbSet<XmlFile> XmlFiles { get; set; }

    }
}