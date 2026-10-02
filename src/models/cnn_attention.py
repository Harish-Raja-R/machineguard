import torch
from torch import nn
import torch.nn.functional as F


class CNNAttentionAutoencoder(nn.Module):
    def __init__(self):
        super().__init__()

        self.encoder = nn.Sequential(
            nn.Conv2d(1, 8, 3, padding=1),
            nn.BatchNorm2d(8),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(8, 16, 3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
        )

        self.attention = nn.Sequential(
            nn.Conv2d(16, 1, 1),
            nn.Sigmoid()
        )

        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(16, 8, 2, stride=2),
            nn.ReLU(),

            nn.ConvTranspose2d(8, 1, 2, stride=2),
        )

    def forward(self, x, return_attention=False):
        features = self.encoder(x)

        attention_map = self.attention(features)

        attended = features * attention_map

        reconstruction = self.decoder(attended)

        if reconstruction.shape[-2:] != x.shape[-2:]:
            reconstruction = F.interpolate(
                reconstruction,
                size=x.shape[-2:],
                mode="bilinear",
                align_corners=False
            )

        if return_attention:
            return reconstruction, attention_map

        return reconstruction


def reconstruction_scores(model, x):
    with torch.no_grad():
        reconstruction, attention = model(
            x,
            return_attention=True
        )

        scores = (
            (reconstruction - x) ** 2
        ).flatten(1).mean(1)

    return scores, attention