using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace CompAgri
{
    public partial class UploadXmlFile : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }
        protected void Upload(object sender, EventArgs e)
        {
            if (FileUpload1.HasFile)
            {
                String Filename = Path.Combine(Server.MapPath("~/XmlFiles"), FileUpload1.FileName);
                FileUpload1.SaveAs(Filename);
            }
        }

    }
}