using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;

namespace CompAgri.Models.Terms
{
    public class Connection: DatabaseTable
    {
        public class PosibleValues
        {
            public IEnumerable<string> Names { get; set; }
            public IEnumerable<string> Synonyms { get; set; }
            public IEnumerable<string> TimeLimitation { get; set; }
            public IEnumerable<string> PositionLimitation { get; set; }
            public IEnumerable<int> AmountLimitation { get; set; }
            public IEnumerable<string> ClimateLimitation { get; set; }
            public IEnumerable<string> SeasonLimitation { get; set; }
            public IEnumerable<string> Measurement { get; set; }
        }

        public static PosibleValues GetPosibleValues()
        {
            using (var db = Database)
            {
                var res = new PosibleValues
                {
                    Names = db.Query<string>("Select * from ConnectionsNames"),
                    Synonyms = db.Query<string>("Select * from ConnectionSynonyms"),
                    TimeLimitation = db.Query<string>("Select * from ConnectionTimeLimitation"),
                    PositionLimitation = db.Query<string>("Select * from ConnectionPositionLimitation"),
                    AmountLimitation = db.Query<int>("Select * from ConnectionAmountLimitation"),
                    ClimateLimitation = db.Query<string>("Select * from ConnectionClimateLimitation"),
                    SeasonLimitation = db.Query<string>("Select * from ConnectionSeasonLimitation"),
                    Measurement = db.Query<string>("Select * from ConnectionMeasurementUnit")
                };

                return res;
            }
        }

        public int Connection_Id { get; set; }
        public int Connection_Left_Term_Id { get; set; }
        public int Connection_Left_Tree_Id { get; set; }
        public int Connection_Right_Tree_Id { get; set; }
        public int Connection_Right_Term_Id { get; set; }
        public string Connection_Name { get; set; }
        public string Connection_Synonym { get; set; }
        public string Connection_Time_Limitation { get; set; }
        public string Connection_Position_Limitation { get; set; }
        public int Connection__Amount_Limitation { get; set; }
        public string Connection_Climate_Limitation { get; set; }
        public string Connection_Season_Limitation { get; set; }
        public string Connection_Measurement { get; set; }

        public Connection Save()
        {
            using (var db = Database)
            {
                // Does not exist, inserting
                if (this.Connection_Id == 0)
                    this.Connection_Id = db.ExecuteScalar<int>(@"
INSERT INTO [Connection]
           ([Connection_Left_Term_Id]
           ,[Connection_Right_Term_Id]
           ,[Connection_Name]
           ,[Connection_Synonym]
           ,[Connection_Time_Limitation]
           ,[Connection_Position_Limitation]
           ,[Connection__Amount_Limitation]
           ,[Connection_Climate_Limitation]
           ,[Connection_Season_Limitation]
           ,[Connection_Measurement])
     VALUES
           (@Connection_Left_Term_Id
           ,@Connection_Right_Term_Id
           ,@Connection_Name
           ,@Connection_Synonym
           ,@Connection_Time_Limitation
           ,@Connection_Position_Limitation
           ,@Connection__Amount_Limitation
           ,@Connection_Climate_Limitation
           ,@Connection_Season_Limitation
           ,@Connection_Measurement);

SELECT CAST(SCOPE_IDENTITY() as int);", this);
                else
                    // Exist, Updating
                    db.Execute(@"
UPDATE [Connection]
   SET [Connection_Left_Term_Id] = @Connection_Left_Term_Id
      ,[Connection_Right_Term_Id] = @Connection_Right_Term_Id
      ,[Connection_Name] = @Connection_Name
      ,[Connection_Synonym] = @Connection_Synonym
      ,[Connection_Time_Limitation] = @Connection_Time_Limitation
      ,[Connection_Position_Limitation] = @Connection_Position_Limitation
      ,[Connection__Amount_Limitation] = @Connection__Amount_Limitation
      ,[Connection_Climate_Limitation] = @Connection_Climate_Limitation
      ,[Connection_Season_Limitation] = @Connection_Season_Limitation
      ,[Connection_Measurement] = @Connection_Measurement
      ,[Connection_IsDelete] = @Connection_IsDelete, bit,>
 WHERE Connection_Id = @Connection_Id", this);
            }

            return this;

        }

        public static IEnumerable<Connection> GetAll()
        {
            using (var db = Database)
            {
                return db.Query<Connection>("SELECT c.*, lt.Term_XmlFile_id as Connection_Left_Tree_Id, rt.Term_XmlFile_id as Connection_Right_Tree_Id FROM [Connection] as c LEFT JOIN Term as lt on c.Connection_Left_Term_Id = lt.Term_Id LEFT JOIN Term as rt on c.Connection_Right_Term_Id = rt.Term_Id");
            }
        }

        public static Connection Find(int Connection_Id)
        {
            using (var db = Database)
            {
                return db.Query<Connection>("SELECT TOP(1) c.*, lt.Term_XmlFile_id as Connection_Left_Tree_Id, rt.Term_XmlFile_id as Connection_Right_Tree_Id FROM [Connection] as c LEFT JOIN Term as lt on c.Connection_Left_Term_Id = lt.Term_Id LEFT JOIN Term as rt on c.Connection_Right_Term_Id = rt.Term_Id WHERE c.Connection_Id = @Connection_Id", new { Connection_Id = Connection_Id }).FirstOrDefault();
            }
        }



        internal static IEnumerable<Connection> GetForTerms(IEnumerable<int> ids)
        {
            using (var db = Database)
            {
                return db.Query<Connection>("SELECT c.*, lt.Term_XmlFile_id as Connection_Left_Tree_Id, rt.Term_XmlFile_id as Connection_Right_Tree_Id FROM [Connection] as c LEFT JOIN Term as lt on c.Connection_Left_Term_Id = lt.Term_Id LEFT JOIN Term as rt on c.Connection_Right_Term_Id = rt.Term_Id WHERE c.Connection_Left_Term_Id IN @Term_Ids OR c.Connection_Right_Term_Id IN @Term_Ids", new { Term_Ids = ids });
            }
        }
    }
}
