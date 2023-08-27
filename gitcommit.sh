for i in `git status |grep modified|awk '{print $2}'`;
do
    diff=`git diff  --numstat --ignore-all-space $i|awk '{print $1}'`;
    if [[ $diff -eq 0 ]]; then
        git checkout -- $i
    fi
done
