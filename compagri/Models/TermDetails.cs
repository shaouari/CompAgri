using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompAgri.Models
{
    public class TermDetails
    {
        public TermDetails(){}

        public TermDetails(Terms.Term term)
        {
            this.term = term;
            this.properties = term.Properties;
            this.children = term.Childen;
            this.parents = term.Parents;
            this.connectedTerms = term.GetConnectedTerms();

        }

        public Terms.Term term { get; set; }

        public IEnumerable<Terms.T_Property> properties { get; set; }

        public IEnumerable<Terms.Term> children { get; set; }

        public IEnumerable<Terms.Term> parents { get; set; }

        public IEnumerable<Terms.Term> connectedTerms { get; set; }
    }
}
