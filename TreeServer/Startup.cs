using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(TreeServer.Startup))]

namespace TreeServer
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Allow CORS
            app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

            ConfigureAuth(app);
        }
    }
}
