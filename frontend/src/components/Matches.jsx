import axios from "axios";
import {
  Box, Typography, Card, CardContent, Chip, Button, Avatar, Grid, Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const avatarColors = ["#2563EB","#7C3AED","#DB2777","#059669","#D97706","#DC2626"];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function Matches({ matches }) {
  const sendRequest = async (toUserId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/swap/send",
        { toUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request sent!");
    } catch (err) {
      alert(err.response?.data?.message || "Error sending request");
    }
  };

  if (matches.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No matches found yet. Update your skills to find better matches!
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <CheckCircleOutlineIcon sx={{ color: "#2563EB" }} />
        <Typography variant="h6" fontWeight={700}>
          Your Matches
        </Typography>
        <Chip
          label={matches.length}
          size="small"
          sx={{ bgcolor: "rgba(37,99,235,0.1)", color: "#2563EB", fontWeight: 700, ml: 0.5 }}
        />
      </Box>

      <Grid container spacing={2.5}>
        {matches.map((m) => {
          const color = getAvatarColor(m.name);
          return (
            <Grid item xs={12} sm={6} key={m._id}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 2.5 }}>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar sx={{ bgcolor: color, width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
                      {getInitials(m.name)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={700} fontSize={15}>{m.name}</Typography>
                      <Typography fontSize={12} color="text.secondary">{m.email}</Typography>
                    </Box>
                    <Chip
                      label="Match"
                      size="small"
                      sx={{ ml: "auto", bgcolor: "rgba(16,185,129,0.1)", color: "#059669", fontWeight: 600, fontSize: 11 }}
                    />
                  </Box>

                  {/* Skills */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.8}>
                      OFFERS
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {m.skillsOffered.map((s, i) => (
                        <Chip key={i} label={s} size="small"
                          sx={{ bgcolor: "rgba(37,99,235,0.08)", color: "#2563EB", fontWeight: 600, fontSize: 11, height: 22 }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.8}>
                      WANTS
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {m.skillsWanted.map((s, i) => (
                        <Chip key={i} label={s} size="small" variant="outlined"
                          sx={{ fontSize: 11, height: 22, borderColor: "#E2E8F0", color: "#64748B" }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Button variant="contained" fullWidth size="small" sx={{ py: 1, fontSize: 13 }}
                    onClick={() => sendRequest(m._id)}
                  >
                    Send Request
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Matches;
