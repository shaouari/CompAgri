using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CompAgri.Common
{
    public class DataHelper
    {
        internal static int AddNode(int xmlFileId, String name, int parentId)
        {
            try
            {
                using (CompAgriConnection ctx = new CompAgriConnection())
                {
                    var newTerm = new Term()
                    {
                        Term_XmlFile_Id = xmlFileId,
                        Term_Title = name
                    };
                    ctx.Terms.Add(newTerm);
                    ctx.SaveChanges();
                    
                    newTerm.Relation1.Add(new Relation { Relation_Parent_Term_Id = parentId, Relation_Child_Term_Id = newTerm.Term_Id });
                    ctx.SaveChanges();
                    return newTerm.Term_Id;
                }
            }
            catch (Exception)
            {
                // Do Nothing !
            }
            return -1;
        }

        internal static void MoveNode(int nodeId, int oldParentId, int newParentId)
        {
            try
            {
                using (CompAgriConnection ctx = new CompAgriConnection())
                {

                    var relation = ctx.Relations.Where(o => o.Relation_Parent_Term_Id == oldParentId && o.Relation_Child_Term_Id == nodeId)
                        .FirstOrDefault();

                    if (relation != null)
                    {
                        relation.Relation_Parent_Term_Id = newParentId;
                        ctx.SaveChanges();
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        internal static void DeleteNode(int nodeId, int parentId)
        {
            try
            {
                using (CompAgriConnection ctx = new CompAgriConnection())
                {
                    var relationToDelete = ctx.Relations.Where(o => o.Relation_Parent_Term_Id == parentId && o.Relation_Child_Term_Id == nodeId)
                        .FirstOrDefault();

                    if (relationToDelete != null)
                    {
                        ctx.Relations.Remove(relationToDelete);
                        ctx.SaveChanges();
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
        }


    }
}