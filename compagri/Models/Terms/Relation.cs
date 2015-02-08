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
    /// Represents a relationship table in the database
    /// </summary>
    public class Relation: DatabaseTable
    {
        public int Relation_Id { get; set; }
        public int Relation_Parent_Term_Id { get; set; }
        public int Relation_Child_Term_Id { get; set; }
        public bool? Relation_IsDelete { get; set; }

        /// <summary>
        /// Finds the Relation using its id
        /// </summary>
        /// <param name="Relation_id"></param>
        /// <returns></returns>
        public static Relation Find(int Relation_id)
        {
            using (var db = Database)
            {
                return db.Query<Relation>("SELECT * FROM Relation WHERE Relation_id = @Relation_id", new { Relation_id = Relation_id }).FirstOrDefault();
            }
        }

        /// <summary>
        /// Makes a query which returns relations
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="paramether"></param>
        /// <returns></returns>
        public static IEnumerable<Relation> Query(string sql, object paramether)
        {
            using (var db = Database)
            {
                return db.Query<Relation>(sql, paramether);
            }
        }

        /// <summary>
        /// Saves the changes of the relationship. If it is a new relationship is saves a new record.
        /// </summary>
        /// <returns></returns>
        public Relation Save()
        {
            using (var db = Database)
            {
                if (this.Relation_Id == 0)
                    this.Relation_Id = db.ExecuteScalar<int>("INSERT INTO Relation(Relation_Parent_Term_Id, Relation_Child_Term_Id, Relation_IsDelete) VALUES (@Relation_Parent_Term_Id, @Relation_Child_Term_Id, @Relation_IsDelete); SELECT CAST(SCOPE_IDENTITY() as int);", this);
                else
                    db.Execute(@"UPDATE Relation SET Relation_Parent_Term_Id = @Relation_Parent_Term_Id, Relation_Child_Term_Id = @Relation_Child_Term_Id, Relation_IsDelete = @Relation_IsDelete WHERE Term_id = @Term_id", this);
            }

            return this;
        }

        /// <summary>
        /// Gets or sets the Parent of the relationship
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal Term Parent_Term
        {
            get
            {
                return Term.Find(Relation_Parent_Term_Id);
            }

            set
            {
                Relation_Parent_Term_Id = value.Term_Id;
            }
        }

        /// <summary>
        /// Get or sets the Child of the relationship
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal Term Child_Term
        {
            get
            {
                return Term.Find(Relation_Child_Term_Id);
            }

            set
            {
                Relation_Child_Term_Id = value.Term_Id;
            }
        }
    }
}
