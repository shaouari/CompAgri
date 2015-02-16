using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Dapper;
using System.Data.SqlClient;

namespace TreeServer.Models.Terms
{
    public class Property: DatabaseTable
    {
        public static IEnumerable<string> AllowedProperties = new String[]{"ES", "SO", "UF", "DF", "DS"};

        public int Property_Id { get; set; }

        public int Property_Term_Id { get; set; }

        public string Property_Key { get; set; }

        public string Property_Value { get; set; }

        public static Property Find(int Property_Id)
        {
            using (var db = Database)
            {
                return db.Query<Property>("SELECT TOP(1) * FROM Property WHERE Property_Id = @Property_Id", new { Property_Id = Property_Id }).FirstOrDefault();
            }
        }

        public Term Term
        {
            get
            {
                return Term.Find(Property_Term_Id);
            }
        }

        public Property Save(SqlConnection db)
        {
            // Does not exist, inserting
            if (this.Property_Id == 0)
                this.Property_Id = db.ExecuteScalar<int>("INSERT INTO Property(Property_Term_Id, Property_Key, Property_Value) VALUES (@Property_Term_Id, @Property_Key, @Property_Value); SELECT CAST(SCOPE_IDENTITY() as int);", this);
            else
                // Exist, Updating
                db.Execute("UPDATE Property SET Property_Term_Id = @Property_Term_Id, Property_Key = @Property_Key, Property_Value = @Property_Value WHERE Property_Id = @Property_Id", this);


            // Method Chain
            return this;
        }

        public Property Save()
        {
            using (var db = Database)
            {
                Save(db);
            }

            return this;
        }

        internal static void SaveMultiple(IEnumerable<Property> propList)
        {
            using (var db = Database)
            {
                foreach (var prop in propList)
                {
                    prop.Save(db);
                }
            }
        }
    }
}
