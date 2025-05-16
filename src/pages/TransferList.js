import React, { useState, useEffect } from 'react';
import { 
  Grid, List, Card, CardHeader, ListItem, ListItemText, ListItemIcon, 
  Checkbox, Button, Divider, Typography, Box
} from '@mui/material';

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

// export default function TransferList({ items, selectedItems, onChange, leftTitle, rightTitle }) {
//   const [checked, setChecked] = useState([]);
//   const [left, setLeft] = useState([]);
//   const [right, setRight] = useState([]);

//   useEffect(() => {
//     if (items && items.length > 0) {
//       const selectedIds = selectedItems || [];
//       const rightList = items.filter(item => selectedIds.includes(item.menuname)).map(item => item.menuname);
//       const leftList = items.filter(item => !selectedIds.includes(item.menuname)).map(item => item.menuname);
      
//       setLeft(leftList);
//       setRight(rightList);
//     }
//   }, [items, selectedItems]);

//   const leftChecked = intersection(checked, left);
//   const rightChecked = intersection(checked, right);

//   const handleToggle = (value) => () => {
//     const currentIndex = checked.indexOf(value);
//     const newChecked = [...checked];

//     if (currentIndex === -1) {
//       newChecked.push(value);
//     } else {
//       newChecked.splice(currentIndex, 1);
//     }

//     setChecked(newChecked);
//   };

//   const numberOfChecked = (items) => intersection(checked, items).length;

//   const handleToggleAll = (items) => () => {
//     if (numberOfChecked(items) === items.length) {
//       setChecked(not(checked, items));
//     } else {
//       setChecked(union(checked, items));
//     }
//   };

//   const handleAllRight = () => {
//     setRight(right.concat(left));
//     setLeft([]);
    
//     const newSelectedMenus = [...right, ...left];
//     if (onChange) onChange(newSelectedMenus);
//   };

//   const handleCheckedRight = () => {
//     setRight(right.concat(leftChecked));
//     setLeft(not(left, leftChecked));
//     setChecked(not(checked, leftChecked));
    
//     const newSelectedMenus = [...right, ...leftChecked];
//     if (onChange) onChange(newSelectedMenus);
//   };

//   const handleCheckedLeft = () => {
//     setLeft(left.concat(rightChecked));
//     setRight(not(right, rightChecked));
//     setChecked(not(checked, rightChecked));
    
//     const newSelectedMenus = not(right, rightChecked);
//     if (onChange) onChange(newSelectedMenus);
//   };

//   const handleAllLeft = () => {
//     setLeft(left.concat(right));
//     setRight([]);
    
//     if (onChange) onChange([]);
//   };

//   const customList = (title, items) => (
//     <Card sx={{ height: '100%' }}>
//       <CardHeader
//         sx={{ px: 2, py: 1 }}
//         // avatar={
//         //   <Checkbox
//         //     onClick={handleToggleAll(items)}
//         //     checked={numberOfChecked(items) === items.length && items.length !== 0}
//         //     indeterminate={
//         //       numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
//         //     }
//         //     disabled={items.length === 0}
//         //     inputProps={{
//         //       'aria-label': 'all items selected',
//         //     }}
//         //   />
//         // }
//         title={title}
//         subheader={`showing all ${items.length}`} 
//         // subheader={`${numberOfChecked(items)}/${items.length} selected`}
//       />
//       <Divider />
//       <List
//         sx={{
//           width: '100%',
//           height: 300,
//           bgcolor: 'background.paper',
//           overflow: 'auto',
//         }}
//         dense
//         component="div"
//         role="list"
//       >
//         {items.map((value) => {
//           const menuItem = value;
//           // Find the menu item from the original items array
//           const menuItemDetails = items.find(item => item.menuname === value) || 
//                       { menuname: value, menuname: `${value}` };
          
//           return (
//             <ListItem
//               key={value}
//               role="listitem"
//               button
//               onClick={handleToggle(value)}
//             >
//               {/* <ListItemIcon>
//                 <Checkbox
//                   checked={checked.indexOf(value) !== -1}
//                   tabIndex={-1}
//                   disableRipple
//                 />
//               </ListItemIcon> */}
//               <ListItemText primary={menuItemDetails.menuname} />
//             </ListItem>
//           );
//         })}
//       </List>
//     </Card>
//   );

//   return (
//     <Grid container spacing={2} justifyContent="center" alignItems="center">
//       <Grid item xs={12} md={5}>
//         {customList(leftTitle || 'Choices', left)}
//       </Grid>
//       <Grid item xs={12} md={2}>
//         <Grid container direction="column" alignItems="center">
//           <Button
//             sx={{ my: 0.5 }}
//             variant="outlined"
//             size="small"
//             onClick={handleAllRight}
//             disabled={left.length === 0}
//             aria-label="move all right"
//           >
//             ≫
//           </Button>
//           <Button
//             sx={{ my: 0.5 }}
//             variant="outlined"
//             size="small"
//             onClick={handleCheckedRight}
//             disabled={leftChecked.length === 0}
//             aria-label="move selected right"
//           >
//             &gt;
//           </Button>
//           <Button
//             sx={{ my: 0.5 }}
//             variant="outlined"
//             size="small"
//             onClick={handleCheckedLeft}
//             disabled={rightChecked.length === 0}
//             aria-label="move selected left"
//           >
//             &lt;
//           </Button>
//           <Button
//             sx={{ my: 0.5 }}
//             variant="outlined"
//             size="small"
//             onClick={handleAllLeft}
//             disabled={right.length === 0}
//             aria-label="move all left"
//           >
//             ≪
//           </Button>
//         </Grid>
//       </Grid>
//       <Grid item xs={12} md={5}>
//         {customList(rightTitle || 'Chosen', right)}
//       </Grid>
//     </Grid>
//   );
// }
export default function TransferList({ items, selectedItems, onChange, leftTitle, rightTitle }) {
  const [checked, setChecked] = useState([]);
  const [left, setLeft] = useState([]); // Should store IDs
  const [right, setRight] = useState([]); // Should store IDs

  useEffect(() => {
    if (items && items.length > 0) {
      const selectedIds = selectedItems || [];
      // Filter items based on IDs
      const rightList = items.filter(item => selectedIds.includes(item.id)).map(item => item.id);
      const leftList = items.filter(item => !selectedIds.includes(item.id)).map(item => item.id);
      
      setLeft(leftList);
      setRight(rightList);
    }
  }, [items, selectedItems]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleAllRight = () => {
    const newRight = [...right, ...left];
    setRight(newRight);
    setLeft([]);
    if (onChange) onChange(newRight);
  };

  const handleCheckedRight = () => {
    const newRight = [...right, ...leftChecked];
    setRight(newRight);
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
    if (onChange) onChange(newRight);
  };

  const handleCheckedLeft = () => {
    const newRight = not(right, rightChecked);
    setLeft([...left, ...rightChecked]);
    setRight(newRight);
    setChecked(not(checked, rightChecked));
    if (onChange) onChange(newRight);
  };

  const handleAllLeft = () => {
    setLeft([...left, ...right]);
    setRight([]);
    if (onChange) onChange([]);
  };

  // Helper function to get menu name by ID
  const getMenuNameById = (id) => {
    const menu = items.find(item => item.id === id);
    return menu ? menu.menuname : id; // Fallback to ID if not found
  };

  const customList = (title, itemIds) => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        title={title}
        subheader={`showing all ${itemIds.length}`} 
      />
      <Divider />
      <List
        sx={{
          width: '100%',
          height: 300,
          bgcolor: 'background.paper',
          overflow: 'auto',
        }}
        dense
        component="div"
        role="list"
      >
        {itemIds.map((id) => (
          <ListItem
            key={id}
            role="listitem"
            button
            onClick={handleToggle(id)}
          >
            <ListItemText primary={getMenuNameById(id)} />
          </ListItem>
        ))}
      </List>
    </Card>
  );

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
      <Grid item xs={12} md={5}>
        {customList(leftTitle || 'Choices', left)}
      </Grid>
      <Grid item xs={12} md={2}>
        <Grid container direction="column" alignItems="center">
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllRight}
            disabled={left.length === 0}
            aria-label="move all right"
          >
            ≫
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleAllLeft}
            disabled={right.length === 0}
            aria-label="move all left"
          >
            ≪
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12} md={5}>
        {customList(rightTitle || 'Chosen', right)}
      </Grid>
    </Grid>
  );
}