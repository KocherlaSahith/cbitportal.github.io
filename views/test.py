def func(a,x):
    final=[0]*100000001
    for i in range(len(a)):
        final[a[i]]+=1   
    return final[x]
print(func([-6,10,-1,20,100000000,15,5,-1,15],10000))            