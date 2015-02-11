using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Newtonsoft.Json;
using System.Xml.Serialization;

namespace CompAgri.Models.Terms
{
    /// <summary>
    /// Represents a term into the database
    /// </summary>
    public class Term : DatabaseTable
    {
        public int Term_Id { get; set; }
        public string Term_Title { get; set; }
        public int Term_XmlFile_id { get; set; }
        
        /// <summary>
        /// Get or sets the XMLFile it belongs to
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal XMLFile XMLFile
        {
            get
            {
                return XMLFile.Find(Term_XmlFile_id);
            }

            set
            {
                Term_XmlFile_id = value.XmlFile_Id;
            }
        }


        /// <summary>
        /// Returns the Parent of the Term
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal Term Parent
        {
            get
            {
                return Term.Find(ParentId);
            }

            set
            {
                throw new NotImplementedException();
            }
        }

        /// <summary>
        /// The Id from the Parent Term
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal int ParentId { get; set; }

        // Only supprts reading
        /// <summary>
        /// Read-only property wich returns all the children nodes
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal IEnumerable<Term> Childen
        {
            get
            {
                // TODO: Optimize this
                return Relation.Query("Select * from Relation WHERE Relation_Parent_Term_Id = @Term_Id and (Relation_IsDelete = 0 or Relation_IsDelete is null)", this).Select(e => e.Child_Term);
            }
        }

        // Only supprts reading
        /// <summary>
        /// Get only property which returns all the childrens id
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal IEnumerable<int> ChildenId
        {
            get
            {
                return Relation.Query("Select Relation_Child_Term_Id from Relation WHERE Relation_Parent_Term_Id = @Term_Id and (Relation_IsDelete = 0 or Relation_IsDelete is null)", this).Select(e => e.Relation_Child_Term_Id);
            }
        }

        /// <summary>
        /// Finds a term for its id. Also retrives its parent id.
        /// </summary>
        /// <param name="Term_id"></param>
        /// <returns></returns>
        public static Term Find(int Term_id)
        {
            using (var db = Database)
            {
                return db.Query<Term>("SELECT TOP(1) t.*, r.Relation_Parent_Term_Id as ParentId FROM Term as t LEFT JOIN (Select * from Relation WHERE Relation_IsDelete = 0 or Relation_IsDelete is null) as r on t.Term_id = r.Relation_Child_Term_Id WHERE Term_id = @Term_id", new { Term_id = Term_id }).FirstOrDefault();
            }
        }

        /// <summary>
        /// Saves the changes in the Term. If it is a new term it is saved in the database.
        /// </summary>
        /// <returns></returns>
        public Term Save()
        {
            using (var db = Database)
            {
                if (this.Term_Id == 0)
                    this.Term_Id = db.ExecuteScalar<int>("INSERT INTO Term(Term_Title, Term_XmlFile_id) VALUES (@Term_Title, @Term_XmlFile_id); SELECT CAST(SCOPE_IDENTITY() as int);", this);
                else
                    db.Execute(@"UPDATE Term SET Term_Title = @Term_Title, Term_XmlFile_id = @Term_XmlFile_id WHERE Term_id = @Term_id", this);
            }

            return this;
        }

        /// <summary>
        /// Gets all the term connections
        /// </summary>
        /// <returns></returns>
        public IEnumerable<Connection> GetConnections()
        {
            using (var db = Database)
            {
                return db.Query<Connection>("SELECT c.*, lt.Term_XmlFile_id as Connection_Left_Tree_Id, rt.Term_XmlFile_id as Connection_Right_Tree_Id FROM [Connection] as c LEFT JOIN Term as lt on c.Connection_Left_Term_Id = lt.Term_Id LEFT JOIN Term as rt on c.Connection_Right_Term_Id = rt.Term_Id WHERE c.Connection_Left_Term_Id = @Term_Id OR c.Connection_Right_Term_Id = @Term_Id", this);
            }
        }
    }
}
