def find_errors(y_true, scores, threshold):
    out=[]
    for i,(y,s) in enumerate(zip(y_true,scores)):
        pred=int(s>=threshold)
        if pred!=int(y):
            out.append({"index":i,"actual":int(y),"score":float(s),"threshold":float(threshold),"prediction":pred})
    return out
