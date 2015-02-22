<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="UploadXmlFile.aspx.cs" Inherits="CompAgri.UploadXmlFile" %>

<!DOCTYPE html>

<!DOCTYPE html>
<html>
<head runat="server">
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Terms Data Entry - XMLFile Upload</title>

    <!-- Bootstrap core CSS -->
    <link href="Content/bootstrap.min.css" rel="stylesheet" />
</head>

<body>

    <div class="container">

        <!-- Static navbar -->
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">Terms Data Entry</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav navbar-right">
                        <li>
                            <!-- Change the url here -->
                            <a href="http://localhost:50991/">Data Entry and Visualization</a></li>
                        <li class="active"><a href="./UploadXmlFile.aspx">XMLFile Upload</a></li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
            <!--/.container-fluid -->
        </nav>

        <h1>XMLFile Upload</h1>

        <form id="form1" runat="server">
            <div>
                <asp:FileUpload ID="FileUpload1" runat="server" />
                <br />
                <asp:Button ID="UploadButton" runat="server" Text="Upload" OnClick="Upload" />
            </div>
        </form>
    </div>

    <script src="Scripts/jquery-1.9.1.min.js"></script>
    <script src="Scripts/bootstrap.min.js"></script>
</body>
</html>
