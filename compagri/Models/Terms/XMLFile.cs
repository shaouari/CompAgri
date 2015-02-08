using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using CompAgri.Models.Tree;
using Newtonsoft.Json;
using System.Xml.Serialization;
using CompAgri.Misc;

namespace CompAgri.Models.Terms
{
    /// <summary>
    /// Maps and gives access to the XMLFile table
    /// </summary>
    public class XMLFile : DatabaseTable
    {
        public int XmlFile_Id { get; set; }

        public string XmlFile_Name { get; set; }

        /// <summary>
        /// Finds an XML File using it id
        /// </summary>
        /// <param name="XmlFile_id">Id of the XML File</param>
        /// <returns>An XMLFile instance representing a row</returns>
        public static XMLFile Find(int XmlFile_id)
        {
            using (var db = Database)
            {
                return db.Query<XMLFile>("SELECT TOP(1) * FROM XmlFile WHERE XmlFile_id = @XmlFile_id", new { XmlFile_id = XmlFile_id }).FirstOrDefault();
            }
        }

        /// <summary>
        /// FindGet all XMLFiles
        /// </summary>
        /// <returns></returns>
        public static IEnumerable<XMLFile> GetAll()
        {
            using (var db = Database)
            {
                return db.Query<XMLFile>("SELECT * FROM XmlFile");
            }
        }


        /// <summary>
        /// Saves changes of the XMLFile to the database. If it is a non saved XMLFile creates a new row
        /// </summary>
        /// <returns> The same object to suppor methos chain</returns>
        public XMLFile Save()
        {
            using (var db = Database)
            {
                // Does not exist, inserting
                if (this.XmlFile_Id == 0)
                    this.XmlFile_Id = db.ExecuteScalar<int>("INSERT INTO XmlFile(XmlFile_Name) VALUES (@XmlFile_Name); SELECT CAST(SCOPE_IDENTITY() as int);", this);
                else
                    // Exist, Updating
                    db.Execute("UPDATE XmlFile SET XmlFile_Name = @XmlFile_Name WHERE XmlFile_id = @XmlFile_id", this);
            }

            // Method Chain 
            return this;
        }

        /// <summary>
        /// Get only property which return a list of all Terms which belongs to the XMLFile
        /// </summary>
        [JsonIgnore]
        [XmlIgnore]
        internal IEnumerable<Term> Terms
        {
            get
            {
                using (var db = Database)
                {
                    // The left join because que need the parent id when building the Tree and when can't query several times just for a field
                    return db.Query<Term>("SELECT t.*, r.Relation_Parent_Term_Id as ParentId  FROM Term as t LEFT JOIN (Select * from Relation WHERE Relation_IsDelete = 0 or Relation_IsDelete is null) as r on t.Term_id = r.Relation_Child_Term_Id WHERE Term_XmlFile_id = @XmlFile_id", this);
                }
            }
        }


        /// <summary>
        /// Builds a tree with all the terms
        /// </summary>
        /// <returns>The tree representing the xml</returns>
        public Tree<Term> getXMLAsTree()
        {
            // we get the terms and make them nodes   
            var terms = Terms.Select(t => new Tree<Term>.NodeClass
            {
                id = t.Term_Id.ToString(),
                title = t.Term_Title,
                data = t
            }).ToArray();

            // This diccionary is necesary to have better performance and low wait time. We need to get randomly nodes, so a Sorted Dictionary is the best option
            var FastAccessTerms = new SortedDictionary<int, Tree<Term>.NodeClass>();

            // Dictionary containing all the added terms
            var TermsAlreadyThere = new Misc.CheckList<int>();

            // Inserting the terms in the Dictionary
            foreach (var term in terms)
            {
                FastAccessTerms[term.data.Term_Id] = term;

            }

            // We create the tree with the info form the node
            var tree = new Tree<Term>("", XmlFile_Name);

            // We take the parentless nodes and asume they are in the root
            foreach (var term in terms.Where(t => t.data.ParentId == 0))
            {
                if (!TermsAlreadyThere[term.data.Term_Id])
                {
                    tree.Root.addChild(term);
                    TermsAlreadyThere[term.data.Term_Id] = true;
                }
            }

            // The other nodes are apended to their parents
            foreach (var term in terms.Where(t => t.data.ParentId != 0))
            {
                if (!TermsAlreadyThere[term.data.Term_Id])
                {
                    // Using the Dictionary for the random access
                    FastAccessTerms[term.data.ParentId].addChild(term);
                    TermsAlreadyThere[term.data.Term_Id] = true;
                }
            }

            return tree;
        }

    }
}
