<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UploadXmlFile.aspx.cs" Inherits="CompAgri.UploadXmlFile" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <asp:FileUpload ID="FileUpload1" runat="server" />
            <br />
            <asp:Button ID="UploadButton" runat="server" Text="Upload" OnClick="Upload" />
        </div>
    </form>
</body>
</html>
