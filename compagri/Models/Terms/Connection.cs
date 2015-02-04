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
            public string[] Names { get; set; }
            public string[] Synonyms { get; set; }
            public string[] TimeLimitation { get; set; }
            public string[] PositionLimitation { get; set; }
            public string[] AmountLimitation { get; set; }
            public string[] ClimateLimitation { get; set; }
            public string[] SeasonLimitation { get; set; }
            public string[] Measurement { get; set; }
        }

        public static PosibleValues GetPosibleValues()
        {
            using (var db = Database)
            {
                var res = new PosibleValues
                {
                    Names = db.Query<string>("Select * from ConnectionsNames").ToArray(),
                    Synonyms = db.Query<string>("Select * from ConnectionSynonyms").ToArray(),
                    TimeLimitation = db.Query<string>("Select * from ConnectionTimeLimitation").ToArray(),
                    PositionLimitation = db.Query<string>("Select * from ConnectionPositionLimitation").ToArray(),
                    AmountLimitation = db.Query<string>("Select * from ConnectionAmountLimitation").ToArray(),
                    ClimateLimitation = db.Query<string>("Select * from ConnectionClimateLimitation").ToArray(),
                    SeasonLimitation = db.Query<string>("Select * from ConnectionSeasonLimitation").ToArray(),
                    Measurement = db.Query<string>("Select * from ConnectionMeasurementUnit").ToArray()
                };

                return res;
            }
        }
    }
}
