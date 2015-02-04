using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CompAgri.Misc
{
    class CheckList<T>:SortedDictionary<T, bool>
    {
        public new bool this[T index]
        {
            get
            {
                var res = false;
                this.TryGetValue(index, out res);
                return res;
            }

            set
            {
                base[index] = value;
            }

        }
    }
}
