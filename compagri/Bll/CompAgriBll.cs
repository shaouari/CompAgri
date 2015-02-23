using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CompAgri.Common;
using Newtonsoft.Json.Linq;

namespace CompAgri.Bll
{
    public class CompAgriBll
    {
        public static int AddNode(int xmlFileId, String name, int parentId, JObject param)
        {
            return DataHelper.AddNode(xmlFileId, name, parentId, param);
        }

        public static void MoveNode(int nodeId, int? oldParentId, int? newParentId)
        {
            DataHelper.MoveNode(nodeId, oldParentId, newParentId);
        }

        public static void DeleteNode(int nodeId, int parentId)
        {
            DataHelper.DeleteNode(nodeId, parentId);
        }

        public static void UploadFile(string filePath)
        {
            DataHelper.UploadFile(filePath);
        }

        public static Models.Tree.Tree<Models.Terms.Term>.RootClass GetTree(int xmlFileId)
        {
            return DataHelper.getTree(xmlFileId);
        }

        public static Models.TermDetails TermDetails(int termId)
        {
            return DataHelper.TermDetails(termId);
        }
        

    }
}
