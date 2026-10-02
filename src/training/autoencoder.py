import time
import torch
from torch import nn

def train_autoencoder(model, train_loader, val_loader=None, epochs=20, lr=1e-3,
                      weight_decay=1e-5, patience=5, device="cpu", checkpoint=None):
    model.to(device)
    opt=torch.optim.AdamW(model.parameters(),lr=lr,weight_decay=weight_decay)
    scheduler=torch.optim.lr_scheduler.ReduceLROnPlateau(opt,mode="min",patience=2,factor=0.5)
    loss_fn=nn.MSELoss()
    best=float("inf"); wait=0; history=[]; start=time.perf_counter()

    for epoch in range(epochs):
        model.train(); total=0.; n=0
        for x in train_loader:
            x=x.to(device)
            opt.zero_grad()
            loss=loss_fn(model(x),x)
            loss.backward(); opt.step()
            total += loss.item()*len(x); n += len(x)
        train_loss=total/max(n,1)

        val_loss=train_loss
        if val_loader is not None:
            model.eval(); total=0.; n=0
            with torch.no_grad():
                for x in val_loader:
                    x=x.to(device); loss=loss_fn(model(x),x)
                    total+=loss.item()*len(x); n+=len(x)
            val_loss=total/max(n,1)

        scheduler.step(val_loss)
        history.append({"epoch":epoch+1,"train_loss":train_loss,"val_loss":val_loss})

        if val_loss < best:
            best=val_loss; wait=0
            if checkpoint: torch.save(model.state_dict(),checkpoint)
        else:
            wait+=1
            if wait>=patience: break

    return {"history":history,"best_val_loss":best,"training_time_sec":time.perf_counter()-start}
