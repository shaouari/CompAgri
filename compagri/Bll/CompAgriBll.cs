using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CompAgri.Common;

namespace CompAgri.Bll
{
    public class CompAgriBll
    {
        public static int AddNode(int xmlFileId, String name, int parentId)
        {
            return DataHelper.AddNode(xmlFileId, name, parentId);
        }

        public static void MoveNode(int nodeId, int oldParentId, int newParentId)
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
        

    }
}