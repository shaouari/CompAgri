using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Xml.Linq;

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

                    newTerm.Relation1.Add(new Relation { Relation_Parent_Term_Id = parentId, Relation_Child_Term_Id = newTerm.Term_Id });

                    ctx.Terms.Add(newTerm);
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
        
        internal static void UploadFile(string filePath)
        {
            try
            {
                using (CompAgriConnection ctx = new CompAgriConnection())
                {
                    ctx.Configuration.AutoDetectChangesEnabled = false;


                    var path = "";
                    path = filePath;
                    string fileName = filePath.Substring(filePath.LastIndexOf('\\') + 1);
                    XDocument docX = XDocument.Load(path);

                    try
                    {
                        XmlFile documentDB = new XmlFile();
                        ctx.XmlFiles.Add(documentDB);
                        documentDB.XmlFile_Name = fileName;
                        
                        ctx.SaveChanges();

                        IEnumerable<XElement> concept = docX.Descendants("CONCEPT");
                        int countConcept = 0;
                        foreach (XElement item in concept)
                        {
                            Term currentTerm = null;
                            foreach (XElement child in item.Descendants())
                            {

                                if (child.Name == "DESCRIPTOR")
                                {
                                    currentTerm = documentDB.Term.FirstOrDefault(d => d.Term_Title == child.Value);
                                    if (currentTerm == null)
                                    {
                                        currentTerm = new Term();
                                        currentTerm.Term_Title = child.Value;
                                        currentTerm.Term_XmlFile_Id = documentDB.XmlFile_Id;
                                        ctx.Terms.Add(currentTerm);
                                        ctx.SaveChanges();
                                    }
                                }
                                else if (child.Name == "BT")
                                {
                                    Term parentTerm = null;
                                    parentTerm = documentDB.Term.FirstOrDefault(d => d.Term_Title == child.Value);
                                    if (parentTerm == null)
                                    {
                                        parentTerm = new Term();
                                        parentTerm.Term_Title = child.Value;
                                        parentTerm.Term_XmlFile_Id = documentDB.XmlFile_Id;
                                        ctx.Terms.Add(parentTerm);
                                        ctx.SaveChanges();
                                    }

                                    Relation relation = new Relation(){
                                        Term = parentTerm,
                                        Term1 = currentTerm
                                    };

                                    ctx.Relations.Add(relation);
                                }
                                else if (child.Name == "NT")
                                {
                                    Term childTerm = null;
                                    childTerm = documentDB.Term.FirstOrDefault(d => d.Term_Title == child.Value);
                                    if (childTerm == null)
                                    {
                                        childTerm = new Term();
                                        childTerm.Term_Title = child.Value;
                                        childTerm.Term_XmlFile_Id = documentDB.XmlFile_Id;
                                        ctx.Terms.Add(childTerm);
                                        ctx.SaveChanges();
                                    }

                                    Relation relation = new Relation()
                                    {
                                        Term = currentTerm,
                                        Term1 = childTerm
                                    };

                                    ctx.Relations.Add(relation);
                                }
                                else
                                {
                                    Property newProperty = new Property() { 
                                        Property_Key = child.Name.LocalName,
                                        Property_Value = child.Value,
                                        Property_Term_Id = currentTerm.Term_Id
                                    };

                                    currentTerm.Property.Add(newProperty);

                                    ctx.Properties.Add(newProperty);

                                }
                            }
                            countConcept++;
                            if (countConcept % 1 == 0)
                            {
                                ctx.SaveChanges();
                            }
                        } // End of For Each !!!
                        ctx.SaveChanges();
                    }
                    catch (Exception e)
                    {
                        String str = e.ToString();
                        String str2 = e.Message;
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                String str = e.ToString();
                String str2 = e.Message;
                throw e;
            }
        }

    }
}